export function convertExtglobToRegex(pattern: string): string {
	let res = ""
	const len = pattern.length
	let i = 0

	while (i < len) {
		const c = pattern[i]!
		if (
			(c === "?" || c === "@" || c === "+" || c === "*" || c === "!") &&
			i + 1 < len &&
			pattern[i + 1] === "("
		) {
			const closeIdx = pattern.indexOf(")", i + 2)
			if (closeIdx !== -1) {
				const inner = pattern.slice(i + 2, closeIdx)
				const innerParts = inner.split("|").map((p) => convertExtglobToRegex(p))
				const innerRegex = innerParts.length === 1 ? innerParts[0]! : `(?:${innerParts.join("|")})`

				if (c === "?") res += `(?:${innerRegex})?`
				else if (c === "@") res += `(?:${innerRegex})`
				else if (c === "+") res += `(?:${innerRegex})+`
				else if (c === "*") res += `(?:${innerRegex})*`
				else if (c === "!") res += `(?!(?:.*${innerRegex})$)[^/]+`

				i = closeIdx + 1
				continue
			}
		}

		if (c === "*") {
			if (i + 1 < len && pattern[i + 1] === "*") {
				const isSlashBefore = i > 0 && pattern[i - 1] === "/"
				const isSlashAfter = i + 2 < len && pattern[i + 2] === "/"
				if (isSlashBefore && isSlashAfter) {
					res += "(?:[^/]+/)*"
					i += 3
					continue
				}
				res += ".*"
				i += 2
				continue
			}
			res += "[^/]*"
			i++
			continue
		}

		if (c === "?") {
			res += "[^/]"
			i++
			continue
		}

		if (c === "[") {
			const closeIdx = pattern.indexOf("]", i + 1)
			if (closeIdx !== -1) {
				const inner = pattern.slice(i + 1, closeIdx)
				if (inner.startsWith("!") || inner.startsWith("^")) {
					res += "[^" + inner.slice(1) + "]"
				} else {
					res += "[" + inner + "]"
				}
				i = closeIdx + 1
				continue
			}
		}

		if (
			c === "." ||
			c === "\\" ||
			c === "+" ||
			c === "^" ||
			c === "$" ||
			c === "(" ||
			c === ")" ||
			c === "{" ||
			c === "}" ||
			c === "|"
		) {
			res += "\\" + c
			i++
			continue
		}

		res += c
		i++
	}

	return res
}
