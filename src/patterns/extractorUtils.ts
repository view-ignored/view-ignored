import type { PatternCompileOptions } from "./patternList.js"
import type { Source } from "./source.js"

import { ruleCompile } from "./resolveSources.js"

export function compileSourceRules(source: Source, options?: PatternCompileOptions): void {
	const rlen = source.rules.length
	for (let i = 0; i < rlen; i++) {
		const r = source.rules[i]!
		if (typeof r !== "function") r.source ||= source
		if ("list" in r && r.compiled === null) ruleCompile(r, options)
	}
}

export function tryExtract<T>(fn: () => T): T | Error {
	try {
		return fn()
	} catch (e) {
		return e as Error
	}
}
