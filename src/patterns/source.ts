import type { PatternSpec } from "./patternList.js"
import type { Resource } from "./resource.js"
import type { GlobRule, Rule, RuleMatch } from "./rule.js"

/**
 * Represents a source of external patterns.
 *
 * @since 0.6.0
 */
export type Source = {
	/**
	 * Specification standard used for pattern compilation.
	 *
	 * @since 0.12.2
	 */
	spec?: PatternSpec
	/**
	 * Parent source for hierarchical ignore file rules.
	 *
	 * @since 0.12.0
	 */
	parent?: Resource
	/**
	 * @internal
	 *
	 * @since 0.11.0
	 */
	_noMatchCache?: RuleMatch
	/**
	 * Patterns defined within the source file.
	 * Those patterns are for ignoring files.
	 *
	 * @see {@link ruleTest}
	 *
	 * @since 0.11.0
	 */
	rules: Rule[]

	/**
	 * Relative path to the source file.
	 *
	 * @since 0.6.0
	 */
	path: string

	/**
	 * Indicates if the matching logic is inverted.
	 * For example, `package.json` `files` field inverts the matching logic,
	 * because it specifies files to include rather than exclude.
	 *
	 * @see {@link ruleTest}
	 *
	 * @since 0.6.0
	 */
	inverted: boolean

	/**
	 * Directory where the source was located.
	 *
	 * @since 0.12.0
	 */
	dir?: string
}

const enum State {
	Normal,
	String,
	Escape,
}

const decoder = new TextDecoder()

function matchesKey(
	key: string,
	path: string,
	targetKey: string | string[] | Set<string>,
): boolean {
	if (typeof targetKey === "string") {
		return targetKey.includes(".") ? path === targetKey : path === targetKey || key === targetKey
	}
	if (Array.isArray(targetKey)) {
		return targetKey.some((t) => (t.includes(".") ? path === t : path === t || key === t))
	}
	for (const t of targetKey) {
		if (t.includes(".") ? path === t : path === t || key === t) return true
	}
	return false
}

/**
 * Locates string array element byte ranges for a key in JSON content.
 *
 * @since 0.13.0
 */
export function scanJsonRuleRanges(
	content: Uint8Array,
	targetKey: string | string[] | Set<string>,
	cb?: (startByte: number, endByte: number) => void,
): [number, number][] {
	const ranges: [number, number][] = []
	let state = State.Normal
	let sStart = -1
	let key = ""
	let inArr = false
	let depth = 0
	const stack: string[] = []
	const len = content.length

	for (let i = 0; i < len; i++) {
		const b = content[i]!

		if (state === State.Escape) {
			state = State.String
			continue
		}

		if (state === State.String) {
			if (b === 92 /* \ */) {
				state = State.Escape
				continue
			}
			if (b === 34 /* " */) {
				state = State.Normal
				const val = decoder.decode(content.subarray(sStart + 1, i))
				if (!inArr) {
					key = val
					continue
				}
				ranges.push([sStart, i + 1])
				if (cb) cb(sStart, i + 1)
			}
			continue
		}

		if (b === 47 /* / */) {
			const n = content[i + 1]
			if (n === 47 /* / */) {
				i += 2
				while (i < len && content[i] !== 10 /* \n */) i++
				continue
			}
			if (n === 42 /* * */) {
				i += 2
				while (i < len - 1 && !(content[i] === 42 && content[i + 1] === 47)) i++
				i++
				continue
			}
		}

		switch (b) {
			case 34: // "
				state = State.String
				sStart = i
				break
			case 58: // :
				if (key) {
					stack[depth] = key
					key = ""
				}
				break
			case 91: // [
				if (depth > 0 && stack[depth]) {
					const curKey = stack[depth]!
					const curPath = stack.slice(1, depth + 1).join(".")
					if (matchesKey(curKey, curPath, targetKey)) inArr = true
				}
				break
			case 93: // ]
				if (inArr) inArr = false
				break
			case 123: // {
				depth++
				break
			case 125: // }
				stack.length = depth
				if (depth > 0) depth--
				break
		}
	}

	return ranges
}

/**
 * Finds the byte range of a property key in JSON content.
 *
 * @since 0.13.0
 */
export function findJsonKeyRange(
	content: Uint8Array,
	targetKey: string | string[] | Set<string>,
): [number, number] | undefined {
	let state = State.Normal
	let sStart = -1
	let key = ""
	let range: [number, number] | undefined
	let depth = 0
	const stack: string[] = []

	const len = content.length

	for (let i = 0; i < len; i++) {
		const b = content[i]!

		if (state === State.Escape) {
			state = State.String
			continue
		}

		if (state === State.String) {
			if (b === 92 /* \ */) state = State.Escape
			else if (b === 34 /* " */) {
				state = State.Normal
				key = decoder.decode(content.subarray(sStart + 1, i))
				range = [sStart, i + 1]
			}
			continue
		}

		if (b === 47 /* / */) {
			const n = content[i + 1]
			if (n === 47 /* / */) {
				i += 2
				while (i < len && content[i] !== 10 /* \n */) i++
				continue
			}
			if (n === 42 /* * */) {
				i += 2
				while (i < len - 1 && !(content[i] === 42 && content[i + 1] === 47)) i++
				i++
				continue
			}
		}

		switch (b) {
			case 58: // :
				if (key) {
					stack[depth] = key
					const curPath = stack.slice(1, depth + 1).join(".")
					if (matchesKey(key, curPath, targetKey)) return range
					key = ""
				}
				break
			case 34: // "
				state = State.String
				sStart = i
				break
			case 123: // {
				depth++
				break
			case 125: // }
				stack.length = depth
				if (depth > 0) depth--
				break
		}
	}

	return undefined
}

/**
 * Converts pattern ("x" (excludes) or "!x" (includes)) to a rule.
 * You can also invert the behavior.
 * It compiles the rule.
 *
 *
 * if !x -> includes + x
 * if x -> excludes + x
 * if invert && !x -> excludes + x
 * if invert && x -> includes + x
 *
 * @since 0.6.0
 */
export function resolveNegatable(
	pattern: string,
	invert: boolean,
	reuse?: GlobRule,
	start?: number,
	end?: number,
): GlobRule {
	let negated = false
	if (pattern.startsWith("\\!")) pattern = pattern.slice(1)
	else if (pattern.startsWith("!")) {
		negated = true
		pattern = pattern.slice(1)
	}
	const excludes = negated === invert
	const iff = reuse && excludes === reuse.excludes
	const rule: GlobRule = iff ? reuse : { compiled: null, excludes, list: [] }
	rule.list.push(pattern)
	if (start !== undefined && end !== undefined) {
		if (iff && rule.range) rule.range[1] = end
		else rule.range = [start, end]
	}
	return rule
}
