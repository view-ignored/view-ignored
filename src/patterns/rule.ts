import type { Dirent } from "node:fs"

import type { PatternFinderOptions } from "./extractor.js"
import type { IgnoresOptions } from "./ignores.js"
import type { MatcherContext } from "./matcherContext.js"
import type { Resource } from "./resource.js"
import type { Source } from "./source.js"

import { type PatternList, type PatternListCompiled } from "./patternList.js"

/**
 * @since 0.12.0
 */
export type InternalRules = {
	/**
	 * Tested before external (source's) rules.
	 *
	 * @since 0.12.0
	 */
	before: Rule[]
	/**
	 * Tested after external (source's) rules.
	 * Overridable by external rules.
	 *
	 * @since 0.12.0
	 */
	after: Rule[]
}

/**
 * Represents a set of include and exclude patterns.
 * These patterns are positive glob patterns.
 *
 * @see {@link ruleTest} provides the ignoring algorithm.
 * @see {@link ruleCompile} compiles the signed pattern.
 * Use this or an extractor's method to compile.
 *
 * @since 0.6.0
 */
export type GlobRule = {
	/**
	 * Associated source for the rule.
	 *
	 * @since 0.13.1
	 */
	source?: Source | null
	/**
	 * 0-indexed start and end byte offsets in the source file buffer.
	 *
	 * @since 0.13.0
	 */
	range?: [number, number]
	/**
	 * Provides ignored or included file and directory patterns.
	 *
	 * @see {@link ruleTest} provides the ignoring algorithm.
	 *
	 * @since 0.11.0
	 */
	list: PatternList
	/**
	 * If `true`, pattern "test" will exclude file named "test".
	 *
	 * @see {@link ruleTest} provides the ignoring algorithm.
	 *
	 * @since 0.9.0
	 */
	excludes: boolean
	/**
	 * Provides compiled ignored or included file and directory patterns.
	 *
	 * @see {@link ruleTest} provides the ignoring algorithm.
	 *
	 * @since 0.6.0
	 */
	compiled: null | PatternListCompiled
}

export type CustomRule = {
	/**
	 * Associated source for the rule.
	 *
	 * @since 0.13.1
	 */
	source?: Source | null
	/**
	 * 0-indexed start and end byte offsets in the source file buffer.
	 *
	 * @since 0.13.0
	 */
	range?: [number, number]
	/**
	 * Applies when `match(path)` returns `string`.
	 * If `true`, path is ignored.
	 *
	 * @since 0.12.0
	 */
	excludes: boolean
	/**
	 * Custom match function.
	 *
	 * @returns The pattern, matching error or null.
	 * It could be `boolean | Error`, but we use `string | null | Error`.
	 * `string` gives us ability to tell why the path is ignored.
	 * User decides what to do with the string, not view-ignored.
	 *
	 * @example
	 *   match(o) {
	 *     if (o.dirent.isSymlink()) {
	 *       // ignores symlinks
	 *       return "//symlink"
	 *     }
	 *     if (o.includes("hi")) {
	 *       return "*hi*" || ("**"+"/*hi*") || "//includes 'hi'"
	 *     }
	 *     if (patternListCompile({ list: ["*hi*"] })) {
	 *       // btw, do not compile inside match, it's slow
	 *       return "*hi*"
	 *     }
	 *     return null
	 *   }
	 *
	 * @example
	 *   // Some standardized examples
	 *
	 *   // message or glob
	 *   return "//starts with 's' && !ends with 't'"
	 *   return "s*[!t]" // can be used instead of "**"+"/s*[!t]"
	 *
	 *   // some other messages
	 *   return "//has 't'"
	 *   return "//!has 't'"
	 *   return "//has 't' at 1"
	 *   return "//base has 't'"
	 *   return "//dirname has 't'"
	 *   return "//dirname base has 't'"
	 *
	 * @since 0.12.0
	 */
	match: (options: IgnoresOptions) => string | Error | null
}

/**
 * Represents a rule that allows skipping directory scanning.
 * It is a functional rule that can return a `MatcherContext` or a `Promise` resolving to one,
 * or `null` if the rule does not apply.
 *
 * @since 0.12.0
 */
export type SkipRule = (
	options: IgnoresOptions,
) => MatcherContext | Promise<MatcherContext | 0 | null> | 0 | null

/**
 * Represents any supported target rule, which can be a glob-based rule,
 * a custom matching rule, or a directory skipping rule.
 *
 * @since 0.6.0
 */
export type Rule = GlobRule | CustomRule | SkipRule

/**
 * The kind of a pattern match.
 *
 * @since 0.9.1
 */
export type MatchKind = RuleMatch["kind"]

/**
 * @see {@link RuleMatch}
 *
 * @since 0.9.1
 */
export interface RuleMatchBase<K extends string | number | symbol> {
	kind: K
	ignored: boolean
}

/**
 * @see {@link RuleMatch}
 *
 * @since 0.9.1
 */
export interface RuleMatchBaseSource<K extends string | number | symbol> extends RuleMatchBase<K> {
	source: Source | null
}

/**
 * @see {@link RuleMatch}
 *
 * @since 0.9.1
 */
export interface RuleMatchBasePattern<K extends string | number | symbol> extends RuleMatchBase<K> {
	pattern: unknown
	rule: Rule
}

/**
 * @see {@link RuleMatch}
 *
 * @since 0.11.0
 */
export interface RuleMatchBaseError<K extends string | number | symbol> extends RuleMatchBase<K> {
	error: Error
}

/**
 * @see {@link RuleMatch}
 *
 * @since 0.11.0
 */
export interface RuleMatchBaseInvalidSource<K extends string | number | symbol>
	extends RuleMatchBaseError<K>, RuleMatchBaseSource<K> {}

/**
 * @see {@link RuleMatch}
 *
 * @since 0.11.0
 */
export interface RuleMatchBaseInvalidPattern<K extends string | number | symbol>
	extends RuleMatchBasePattern<K>, RuleMatchBaseError<K> {}

/**
 * @see {@link RuleMatch}
 *
 * @since 0.11.0
 */
export interface RuleMatchBaseInvalidExternal<K extends string | number | symbol>
	extends RuleMatchBaseInvalidPattern<K>, RuleMatchBaseSource<K> {}

/**
 * @see {@link RuleMatch}
 *
 * @since 0.9.1
 */
export interface RuleMatchBaseExternal<K extends string | number | symbol>
	extends RuleMatchBasePattern<K>, RuleMatchBaseSource<K> {}

/**
 * The kind of a pattern match.
 *
 * @since 0.11.0
 */
export const enum RuleMatchKind {
	none,
	missingSource,
	noMatch,
	invalidSource,
	invalidExternal,
	invalidInternal,
	external,
	internal,
}

/**
 * @see {@link ruleTest}
 *
 * @since 0.6.0
 */
export type RuleMatch =
	| RuleMatchBase<RuleMatchKind.none>
	| RuleMatchBase<RuleMatchKind.missingSource>
	| RuleMatchBaseSource<RuleMatchKind.noMatch>
	| RuleMatchBaseInvalidSource<RuleMatchKind.invalidSource>
	| RuleMatchBaseInvalidExternal<RuleMatchKind.invalidExternal>
	| RuleMatchBaseInvalidPattern<RuleMatchKind.invalidInternal>
	| RuleMatchBaseExternal<RuleMatchKind.external>
	| RuleMatchBasePattern<RuleMatchKind.internal>

/**
 * Check if a rule match is invalid.
 *
 * @since 0.11.0
 */
export function isRuleMatchInvalid(
	match: RuleMatch,
): match is
	| RuleMatchBaseInvalidSource<RuleMatchKind.invalidSource>
	| RuleMatchBaseInvalidExternal<RuleMatchKind.invalidExternal>
	| RuleMatchBaseInvalidPattern<RuleMatchKind.invalidInternal> {
	const k = match.kind
	return (
		k === RuleMatchKind.invalidSource ||
		k === RuleMatchKind.invalidExternal ||
		k === RuleMatchKind.invalidInternal
	)
}

/**
 * Check if a rule match is pattern-based.
 *
 * @since 0.13.0
 */
export function isRuleMatchPattern(
	match: RuleMatch,
): match is
	| RuleMatchBaseInvalidExternal<RuleMatchKind.invalidExternal>
	| RuleMatchBaseInvalidPattern<RuleMatchKind.invalidInternal>
	| RuleMatchBaseExternal<RuleMatchKind.external>
	| RuleMatchBasePattern<RuleMatchKind.internal> {
	const k = match.kind
	return (
		k === RuleMatchKind.external ||
		k === RuleMatchKind.internal ||
		k === RuleMatchKind.invalidExternal ||
		k === RuleMatchKind.invalidInternal
	)
}

/**
 * @see {@link ruleTest}
 *
 * @since 0.6.0
 */
export interface RuleTestOptions extends PatternFinderOptions {
	/**
	 * Relative entry path.
	 *
	 * @example
	 * "dir/subdir"
	 * "dir/subdir/index.js"
	 *
	 * @since 0.6.0
	 */
	entry: string

	/**
	 * Result of the `dirname(entry)` call.
	 *
	 * @since 0.12.0
	 */
	parentPath: string

	/**
	 * Pre-lowercased entry path.
	 *
	 * @since 0.11.0
	 */
	lowerEntry?: string

	/**
	 * The filesystem entry's Dirent representation if available.
	 *
	 * @since 0.12.0
	 */
	dirent: Dirent

	/**
	 * Remaining max depth.
	 */
	depth?: number

	/**
	 * Scoped within paths.
	 */
	within?: string | string[]
}

function cacheTest(rs: null | PatternListCompiled, path: string): string | null {
	if (!rs || !rs.re.test(path)) return null
	if (rs.list.length === 1) return rs.list[0]!

	const items = rs.compiledItems
	for (let i = 0; i < items.length; i++) {
		if (items[i]!.test(path)) return rs.list[i]!
	}
	throw new Error("view-ignored has crashed: expected sub-pattern", { cause: rs })
}

type IgnoreOptsHolder = { opts: IgnoresOptions | null }

function evalRule(
	rule: GlobRule | CustomRule,
	entryPath: string,
	options: RuleTestOptions,
	src: Resource,
	holder: IgnoreOptsHolder,
): string | Error | null {
	if ("match" in rule) {
		holder.opts ||= {
			cwd: options.cwd,
			dirent: options.dirent,
			entry: options.entry,
			fs: options.fs,
			lowerEntry: options.lowerEntry,
			parentPath: options.parentPath,
			resource: src,
			signal: options.signal,
			target: options.target,
		}
		holder.opts.resource = src
		return rule.match(holder.opts)
	}
	return cacheTest(rule.compiled!, entryPath)
}

const MISSING_SOURCE_MATCH: RuleMatch = Object.freeze({
	ignored: false,
	kind: RuleMatchKind.missingSource,
})

/**
 * Synchronous version of {@link ruleTest}.
 *
 * @since 0.11.0
 */
export function ruleTestSync(options: RuleTestOptions): RuleMatch {
	const src = options.resource
	if (src === undefined) throw new Error("view-ignored has crashed: no source cached")
	if (src !== null && "error" in src)
		return { ...src, ignored: true, kind: RuleMatchKind.invalidSource }

	const entry =
		options.dirent.isDirectory() && !options.entry.endsWith("/")
			? options.entry + "/"
			: options.entry

	const { internalRules } = options.target
	const beforeInternal = Array.isArray(internalRules) ? internalRules : internalRules.before
	const holder: IgnoreOptsHolder = { opts: null }

	if (beforeInternal.length > 0) {
		const internalMatch = ruleTestInternalSync(beforeInternal, options, src, entry, holder)
		if (internalMatch) return internalMatch
	}

	let currentSrc: Resource = src
	let hasInverted = false
	while (currentSrc !== null && !("error" in currentSrc)) {
		if (currentSrc.inverted) hasInverted = true
		const { rules } = currentSrc

		for (let i = 0; i < rules.length; i++) {
			const rule = rules[i]!
			if (typeof rule === "function") continue
			const res = evalRule(rule, entry, options, currentSrc, holder)
			if (res === null) continue
			if (res instanceof Error) {
				return {
					error: res,
					ignored: false,
					kind: RuleMatchKind.invalidExternal,
					pattern: "",
					rule,
					source: currentSrc,
				}
			}
			return {
				ignored: rule.excludes,
				kind: RuleMatchKind.external,
				pattern: res,
				rule,
				source: currentSrc,
			}
		}

		currentSrc = currentSrc.parent ?? null
	}

	if (!Array.isArray(internalRules) && internalRules.after.length > 0) {
		const internalMatch = ruleTestInternalSync(internalRules.after, options, src, entry, holder)
		if (internalMatch) return internalMatch
	}

	if (src === null) return MISSING_SOURCE_MATCH

	return (src._noMatchCache ||= {
		ignored: hasInverted || src.inverted || false,
		kind: RuleMatchKind.noMatch,
		source: src,
	})
}

function ruleTestInternalSync(
	rules: Rule[],
	options: RuleTestOptions,
	src: Resource,
	entryPath: string,
	holder: IgnoreOptsHolder,
): RuleMatch | void {
	for (let i = 0; i < rules.length; i++) {
		const rule = rules[i]!
		if (typeof rule === "function") continue
		const res = evalRule(rule, entryPath, options, src, holder)
		if (res === null) continue

		const source = "source" in rule && rule.source ? (rule.source as Source) : null
		const isErr = res instanceof Error
		const kind = isErr
			? source
				? RuleMatchKind.invalidExternal
				: RuleMatchKind.invalidInternal
			: source
				? RuleMatchKind.external
				: RuleMatchKind.internal

		const match: Record<string, unknown> = {
			ignored: isErr ? false : rule.excludes,
			kind,
			pattern: isErr ? "" : res,
			rule,
		}
		if (isErr) match.error = res
		if (source) match.source = source
		return match as unknown as RuleMatch
	}
}

/**
 * Checks whether a given entry should be ignored based on internal and external patterns.
 * Populates unknown sources using {@link resolveSources}.
 *
 * @since 0.6.0
 */
export function ruleTest(
	options: RuleTestOptions,
	cb: (err: Error | null, match: RuleMatch) => void,
): void {
	try {
		cb(null, ruleTestSync(options))
	} catch (err) {
		// oxlint-disable-next-line typescript/no-explicit-any
		cb(err as Error, null as any)
	}
}
