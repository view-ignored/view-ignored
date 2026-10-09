import zeptomatch from "zeptomatch"

import { convertExtglobToRegex } from "./extglob.js"
import { wildmatchCompile } from "./wildmatch.js"

/**
 * Pattern specification standard.
 *
 * @since 0.12.2
 */
export const enum PatternSpec {
	gitignore,
	npmignore,
	packageJsonFiles,
}

/**
 * @since 0.8.0
 */
export type PatternCompileOptions = {
	/**
	 * Disables case sensitivity.
	 *
	 * @default false
	 *
	 * @since 0.8.0
	 */
	nocase?: boolean
	/**
	 * The specification standard used for pattern compilation.
	 *
	 * @since 0.12.2
	 */
	spec?: PatternSpec
	/**
	 * The list of patterns to use as context for matching.
	 *
	 * @default []
	 *
	 * @since 0.12.0
	 */
	list?: PatternList
}

/**
 * Represents a list of positive glob patterns.
 *
 * @since 0.6.0
 */
export type PatternList = string[]

/**
 * Provides regexes and sources.
 * @see {@link patternListCompile}
 *
 * @since 0.12.2
 */
export type PatternListCompiled = {
	/**
	 * The matcher.
	 *
	 * @since 0.12.2
	 */
	re: { test(string: string, lowerPath?: string): boolean }
	/**
	 * The matcher.
	 *
	 * @since 0.12.2
	 */
	list: PatternList
	compiledItems: RegExp[]
}

const REGEX_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g

/**
 * Compiles the {@link PatternList}.
 *
 * @see {@link ruleCompile}
 *
 * @since 0.6.0
 */
export function patternListCompile(
	options: PatternCompileOptions & { list: PatternList },
): PatternListCompiled | null {
	if (options.spec === PatternSpec.gitignore) return wildmatchCompile(options)

	const nocase = !!options.nocase
	const { list } = options
	const len = list.length

	if (len === 0) throw new TypeError("Empty pattern is useless and wastes memory")

	const patternSources: string[] = new Array(len)

	for (let i = 0; i < len; i++) {
		const pattern = list[i]!
		let start = 0
		let end = pattern.length

		const isRoot = end > 0 && pattern.charCodeAt(0) === 47
		const isRelative = end >= 2 && pattern.charCodeAt(0) === 46 && pattern.charCodeAt(1) === 47
		const isAnchored = isRoot || isRelative || options.spec === PatternSpec.packageJsonFiles

		if (isRelative) start = 2
		if (end > start && pattern.charCodeAt(end - 1) === 47) end--
		if (isRoot && start < end && pattern.charCodeAt(start) === 47) start++

		const cleaned = start === 0 && end === pattern.length ? pattern : pattern.slice(start, end)

		let part = ""
		let isGlob = false
		const clen = cleaned.length
		for (let j = 0; j < clen; j++) {
			const c = cleaned.charCodeAt(j)
			if (c === 42 || c === 63 || c === 91 || c === 40 || c === 41 || c === 33) {
				isGlob = true
				break
			}
		}

		if (isGlob) {
			if (
				cleaned.includes("!(") ||
				cleaned.includes("?(") ||
				cleaned.includes("@(") ||
				cleaned.includes("+(") ||
				cleaned.includes("*(")
			) {
				part = convertExtglobToRegex(cleaned)
			} else {
				const isMatchRe = zeptomatch.compile(cleaned)
				part = isMatchRe.source
				if (part.startsWith("^")) part = part.slice(1)
				if (part.endsWith("[\\/]?$")) part = part.slice(0, -7)
				else if (part.endsWith("$")) part = part.slice(0, -1)
			}
		} else {
			part = cleaned.replaceAll(REGEX_SPECIAL_CHARS, "\\$&")
		}

		const source = (isAnchored ? "^" : "(?:^|\\/)") + part + "(?:\\/|$)"
		patternSources[i] = source
	}

	const combinedSource = len === 1 ? patternSources[0]! : patternSources.join("|")
	const combinedRegex = new RegExp(combinedSource, nocase ? "i" : "")

	const compiledItems = len === 1 ? [] : patternSources.map((s) => new RegExp(s, nocase ? "i" : ""))

	return { compiledItems, list, re: combinedRegex }
}
