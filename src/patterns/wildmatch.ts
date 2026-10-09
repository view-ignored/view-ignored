import type { PatternCompileOptions, PatternList, PatternListCompiled } from "./patternList.js"

const REGEX_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g

const POSIX_CLASSES: Record<string, string> = {
	alnum: "a-zA-Z0-9",
	alpha: "a-zA-Z",
	blank: " \\t",
	cntrl: "\\x00-\\x1f\\x7f",
	digit: "0-9",
	graph: "\\x21-\\x7e",
	lower: "a-z",
	print: "\\x20-\\x7e",
	punct: "!\"#$%&'()*+,\\-./:;<=>?@[\\\\\\]^_`{|}~",
	space: "\\s",
	upper: "A-Z",
	xdigit: "0-9a-fA-F",
}

function parseEscapedInBracket(
	pattern: string,
	pos: number,
	closeIdx: number,
	classBody: string,
): { appended: string; newPos: number } {
	const nextPos = pos + 1
	if (nextPos >= closeIdx) return { appended: "\\\\", newPos: nextPos }

	const nextC = pattern[nextPos]!
	if (nextC === "-") {
		const rest = pattern.slice(nextPos + 1, closeIdx)
		const isRange = classBody.endsWith("-") || rest.startsWith("-") || rest.startsWith("\\-")
		return { appended: isRange ? "-" : "\\-", newPos: nextPos + 1 }
	}

	if (nextC === "\\") return { appended: "\\\\\\\\", newPos: nextPos + 1 }
	if (nextC === "]" || nextC === "^") return { appended: "\\" + nextC, newPos: nextPos + 1 }

	return { appended: nextC.replace(REGEX_SPECIAL_CHARS, "\\$&"), newPos: nextPos + 1 }
}

/**
 * Parses a bracket expression `[...]` starting at index `startIdx` in `pattern`.
 * Returns `{ source: string, nextIdx: number }` if valid bracket, or `null` if unclosed/invalid.
 */
function parseBracket(
	pattern: string,
	startIdx: number,
): { source: string; nextIdx: number } | null {
	const len = pattern.length
	let i = startIdx + 1

	if (i >= len) return null

	let negated = false
	if (pattern[i] === "!" || pattern[i] === "^") {
		negated = true
		i++
	}

	if (i >= len) return null

	let closeIdx = -1
	let scan = i
	if (scan < len && pattern[scan] === "]") scan++

	while (scan < len) {
		if (pattern[scan] === "\\") {
			scan += 2
			continue
		}
		if (pattern[scan] === "[" && pattern[scan + 1] === ":") {
			const posixEnd = pattern.indexOf(":]", scan + 2)
			if (posixEnd !== -1) {
				if (!(pattern.slice(scan + 2, posixEnd) in POSIX_CLASSES)) return null
				scan = posixEnd + 2
				continue
			}
		}
		if (pattern[scan] === "]") {
			closeIdx = scan
			break
		}
		scan++
	}

	if (closeIdx === -1) return null

	let classBody = ""
	let pos = i

	while (pos < closeIdx) {
		if (pattern[pos] === "[" && pattern[pos + 1] === ":" && closeIdx - pos >= 4) {
			const endPosix = pattern.indexOf(":]", pos + 2)
			if (endPosix !== -1 && endPosix < closeIdx) {
				const className = pattern.slice(pos + 2, endPosix)
				if (className in POSIX_CLASSES) {
					classBody += POSIX_CLASSES[className]
					pos = endPosix + 2
					continue
				}
				return null
			}
		}

		const c = pattern[pos]!

		if (c === "\\") {
			const res = parseEscapedInBracket(pattern, pos, closeIdx, classBody)
			classBody += res.appended
			pos = res.newPos
			continue
		}

		if (c === "-") {
			if (pos === i || pos === closeIdx - 1) {
				classBody += "\\-"
			} else {
				if (pattern.charCodeAt(pos - 1) > pattern.charCodeAt(pos + 1)) return null
				classBody += "-"
			}
			pos++
			continue
		}

		if (c === "]" || c === "^") {
			classBody += "\\" + c
			pos++
			continue
		}

		classBody += c.replace(REGEX_SPECIAL_CHARS, "\\$&")
		pos++
	}

	return { nextIdx: closeIdx + 1, source: negated ? `[^/${classBody}]` : `[${classBody}]` }
}

/**
 * Converts a wildmatch pattern to regex source string under WM_PATHNAME / gitignore semantics.
 */
function wildmatchToRegexpSource(pattern: string): string {
	let start = 0
	let end = pattern.length

	const isRoot = end > 0 && pattern.charCodeAt(0) === 47
	const isRelative = end >= 2 && pattern.charCodeAt(0) === 46 && pattern.charCodeAt(1) === 47

	if (isRelative) start = 2

	let hasLeadingGlobstar = false
	while (
		end - start >= 3 &&
		pattern.charCodeAt(start) === 42 &&
		pattern.charCodeAt(start + 1) === 42 &&
		pattern.charCodeAt(start + 2) === 47
	) {
		start += 3
		hasLeadingGlobstar = true
	}

	const hasTrailingSlash = end > start && pattern.charCodeAt(end - 1) === 47
	if (hasTrailingSlash) end--
	if (isRoot && start < end && pattern.charCodeAt(start) === 47) start++

	const cleaned = start === 0 && end === pattern.length ? pattern : pattern.slice(start, end)
	if (cleaned === "**" || pattern === "**") return ".*"

	const isAnchored = (isRoot || isRelative || cleaned.includes("/")) && !hasLeadingGlobstar

	let res = ""
	const len = cleaned.length
	let i = 0

	while (i < len) {
		const c = cleaned[i]!

		if (c === "\\") {
			i++
			res += i < len ? cleaned[i]!.replace(REGEX_SPECIAL_CHARS, "\\$&") : "\\\\"
			i++
			continue
		}

		if (c === "[") {
			const bracketResult = parseBracket(cleaned, i)
			if (bracketResult !== null) {
				res += bracketResult.source
				i = bracketResult.nextIdx
				continue
			}
			if (i === len - 1 || (i + 1 < len && cleaned[i + 1] === "]")) {
				res += "\\["
				i++
				continue
			}
			res += "(?!)"
			i++
			continue
		}

		if (c === "?") {
			res += "[^/]"
			i++
			continue
		}

		if (c === "/") {
			if (i + 2 < len && cleaned[i + 1] === "*" && cleaned[i + 2] === "*") {
				const isAtEnd = i + 3 === len
				const isSlashAfter = i + 3 < len && cleaned[i + 3] === "/"
				if (isSlashAfter || isAtEnd) {
					res += isSlashAfter ? "(?:/[^/]+)*" : "(?:/.*)"
					i += 3
					continue
				}
			}
			res += "/"
			i++
			continue
		}

		if (c === "*") {
			if (i + 1 < len && cleaned[i + 1] === "*") {
				const isSlashBefore = i > 0 && cleaned[i - 1] === "/"
				const isSlashAfter = i + 2 < len && cleaned[i + 2] === "/"
				const isAtEnd = i + 2 === len

				if (isSlashBefore && (isSlashAfter || isAtEnd)) {
					res += isSlashAfter ? "(?:/[^/]+)*" : "(?:/.*)"
					i += isSlashAfter ? 3 : 2
					continue
				}

				res += "[^/]*"
				i += 2
				continue
			}

			res += "[^/]*"
			i++
			continue
		}

		res += c.replace(REGEX_SPECIAL_CHARS, "\\$&")
		i++
	}

	const prefix = hasLeadingGlobstar ? "(?:^|.*\\/)" : isAnchored ? "^" : "(?:^|\\/)"
	const suffix = hasTrailingSlash ? "\\/" : "(?:\\/|$)"
	return prefix + res + suffix
}

/**
 * Compiles a list of wildmatch patterns into a single matcher object.
 */
export function wildmatchCompile(
	options: PatternCompileOptions & { list: PatternList },
): PatternListCompiled {
	const nocase = !!options.nocase
	const { list } = options
	const len = list.length

	if (len === 0) throw new TypeError("Empty pattern is useless and wastes memory")

	const patternSources: string[] = new Array(len)
	for (let i = 0; i < len; i++) patternSources[i] = wildmatchToRegexpSource(list[i]!)

	const combinedSource =
		len === 1 ? patternSources[0]! : patternSources.map((p) => `(?:${p})`).join("|")
	let combinedRegex: RegExp
	try {
		combinedRegex = new RegExp(combinedSource, nocase ? "i" : "")
	} catch {
		combinedRegex = /(?!)/
	}

	const compiledItems = len === 1 ? [] : patternSources.map((s) => new RegExp(s, nocase ? "i" : ""))

	return { compiledItems, list, re: combinedRegex }
}
