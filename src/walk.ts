import type { Dirent } from "node:fs"

import type { IgnoresOptions } from "./patterns/ignores.js"
import type { MatcherContext, Total } from "./patterns/matcherContext.js"
import type { MatcherStream } from "./patterns/matcherStream.js"
import type { Resource } from "./patterns/resource.js"
import type { ScanOptions } from "./types.js"

import { PatternSpec } from "./patterns/patternList.js"
import {
	isRuleMatchInvalid,
	isRuleMatchPattern,
	type RuleMatch,
	RuleMatchKind,
	ruleTestSync,
	type Rule,
	type InternalRules,
} from "./patterns/rule.js"
import { dirname } from "./unixify.js"

export type WalkOptions = {
	relPath: string
	lowerEntry?: string
	parentPath: string
	entry: Dirent
	resource: Resource
	stream: MatcherStream | undefined
	scanOptions: Required<ScanOptions>
	depth: number
}

export class WalkResult {
	includeParent = false
	next: 0 | 1 = 0
	context: MatcherContext | null | undefined = undefined

	constructor(
		public path: string,
		public parentPath: string,
		public match: RuleMatch,
		public depth: number,
		public isDir: boolean,
		public entry: Dirent,
		public tooDeep = false,
	) {}
}

export type WalkTotal = {
	dir: string
	matchedFiles: number
	matchedDirs: number
	depth: number
	ignored: boolean
}

export function isMatchExcluded(invert: boolean | 2, match: RuleMatch): boolean {
	return invert === true ? !match.ignored : invert === 2 ? false : match.ignored
}

export function isMatchIncluded(match: RuleMatch, invert: boolean | 2): boolean {
	return !isRuleMatchInvalid(match) && !isMatchExcluded(invert, match)
}

const ruleMatchIgnoredNone: RuleMatch = { ignored: true, kind: RuleMatchKind.none }

function getWalkResult(match: RuleMatch, options: WalkOptions, isDir: boolean): WalkResult {
	const { entry, scanOptions, relPath: path, parentPath, depth } = options
	const { depth: maxDepth, invert, skipDepth } = scanOptions

	const tooDeepFlag = skipDepth && depth > maxDepth
	const result = new WalkResult(
		isDir ? path + "/" : path,
		parentPath,
		match,
		depth,
		isDir,
		entry,
		tooDeepFlag,
	)

	if (isRuleMatchInvalid(match)) return result
	if (isMatchExcluded(invert, match)) {
		if (
			isDir &&
			match.ignored &&
			match.kind !== RuleMatchKind.noMatch &&
			(match.kind !== RuleMatchKind.external || match.source?.spec === PatternSpec.gitignore)
		) {
			result.next = 1
		}
		return result
	}
	if (tooDeepFlag) {
		result.next = isDir ? 0 : 1
		return result
	}
	if (depth > maxDepth) {
		result.tooDeep = true
		return result
	}
	if (!isDir && parentPath !== "" && parentPath !== ".") result.includeParent = true
	return result
}

function handleRuleResolvedCtx(
	resolvedCtx: MatcherContext | 0 | null,
	options: WalkOptions,
	runSync: () => WalkResult,
): WalkResult {
	if (resolvedCtx === null) return runSync()
	const res = new WalkResult(
		options.relPath + "/",
		options.parentPath,
		ruleMatchIgnoredNone,
		options.depth,
		true,
		options.entry,
	)
	res.context = resolvedCtx === 0 ? null : resolvedCtx
	res.next = 1
	return res
}

function runIgnoresSync(options: WalkOptions, isDir: boolean): WalkResult {
	const { entry, scanOptions, relPath: path, lowerEntry, parentPath, resource, depth } = options
	const { target, depth: maxDepth, fs, cwd, signal, within } = scanOptions
	const match = ruleTestSync({
		cwd,
		depth: maxDepth - depth,
		dirent: entry,
		entry: path,
		fs,
		lowerEntry,
		parentPath,
		resource,
		signal,
		target,
		within,
	})
	return getWalkResult(match, options, isDir)
}

function checkRulesList(
	list: Rule[] | null | undefined,
	options: WalkOptions,
	maxDepth: number,
	isDir: boolean,
): WalkResult | Promise<WalkResult> | null {
	if (!list?.length) return null
	const { entry, scanOptions, relPath: path, lowerEntry, parentPath, resource, depth } = options
	const { target, fs, cwd, signal, within } = scanOptions

	let ignoreOptions: IgnoresOptions | undefined

	for (let i = 0; i < list.length; i++) {
		const rule = list[i]!
		if (typeof rule !== "function") continue

		ignoreOptions ||= {
			cwd,
			depth: maxDepth - depth,
			dirent: entry,
			entry: path,
			fs,
			lowerEntry,
			parentPath,
			resource,
			signal,
			target,
			within,
		}

		const res = rule(ignoreOptions)
		if (res === null) continue

		if (res instanceof Promise) {
			return res.then(
				(resolvedCtx) =>
					handleRuleResolvedCtx(resolvedCtx, options, () => runIgnoresSync(options, isDir)),
				(err) => {
					throw err
				},
			)
		}
		const walkRes = new WalkResult(path + "/", parentPath, ruleMatchIgnoredNone, depth, true, entry)
		walkRes.context = res === 0 ? null : res
		walkRes.next = 1
		return walkRes
	}
	return null
}

/**
 * @since 0.11.0
 */
export function walkIncludes(options: WalkOptions): WalkResult | Promise<WalkResult> {
	const { entry, scanOptions } = options
	const { target, depth: maxDepth } = scanOptions
	const isDir = entry.isDirectory()

	if (!isDir || !target.internalRules) return runIgnoresSync(options, isDir)

	const isArr = Array.isArray(target.internalRules)
	const list1 = isArr
		? (target.internalRules as Rule[])
		: (target.internalRules as InternalRules).before
	const list2 = isArr ? null : (target.internalRules as InternalRules).after

	const res1 = checkRulesList(list1, options, maxDepth, isDir)
	if (res1 !== null) return res1

	const res2 = checkRulesList(list2, options, maxDepth, isDir)
	if (res2 !== null) return res2

	return runIgnoresSync(options, isDir)
}

abstract class BaseSyntheticDirent implements Dirent {
	constructor(
		public name: string,
		public parentPath: string,
	) {}

	isBlockDevice(): boolean {
		return false
	}
	isCharacterDevice(): boolean {
		return false
	}
	isFIFO(): boolean {
		return false
	}
	isSocket(): boolean {
		return false
	}
	isSymbolicLink(): boolean {
		return false
	}

	abstract isDirectory(): boolean
	abstract isFile(): boolean
}

class SyntheticDirDirent extends BaseSyntheticDirent {
	isDirectory(): boolean {
		return true
	}
	isFile(): boolean {
		return false
	}
}

class SyntheticFileDirent extends BaseSyntheticDirent {
	isDirectory(): boolean {
		return false
	}
	isFile(): boolean {
		return true
	}
}

export function createSyntheticDirent(name: string, parentPath: string, isDir: boolean): Dirent {
	return isDir
		? new SyntheticDirDirent(name, parentPath)
		: new SyntheticFileDirent(name, parentPath)
}

function pathParentAndName(path: string, isDir: boolean) {
	const clean = isDir ? path.slice(0, -1) : path
	const idx = clean.lastIndexOf("/")
	return {
		name: idx === -1 ? clean : clean.slice(idx + 1),
		parentPath: idx === -1 ? "." : clean.slice(0, idx),
	}
}

function patch(
	ctx: MatcherContext,
	stream: MatcherStream | undefined,
	path: string,
	entry: Dirent,
	match: RuleMatch,
): void {
	if (ctx.paths.has(path)) return
	ctx.paths.set(path, match)
	if (!stream) return

	if (path.endsWith("/") && !entry.isDirectory()) {
		const { name, parentPath } = pathParentAndName(path, true)
		const dirDirent = createSyntheticDirent(name, parentPath, true)
		stream.dispatchEvent(new CustomEvent("dirent", { detail: { dirent: dirDirent, match, path } }))
		return
	}

	stream.dispatchEvent(new CustomEvent("dirent", { detail: { dirent: entry, match, path } }))
}

function patchMerged(
	ctx: MatcherContext,
	stream: MatcherStream | undefined,
	mergedCtx: MatcherContext,
): void {
	for (const rule of mergedCtx.matchedRules) ctx.matchedRules.add(rule)

	if (mergedCtx.paths.dirs) {
		for (const dir of mergedCtx.paths.dirs.keys()) {
			ctx.paths.dirs.set(dir, mergedCtx.paths.dirs.get(dir)!)
		}
	}

	for (const path of mergedCtx.paths.keys()) {
		if (ctx.paths.has(path)) continue
		const match = mergedCtx.paths.get(path)!
		ctx.paths.set(path, match)
		if (!stream) continue

		const isDir = path.endsWith("/")
		const { name, parentPath } = pathParentAndName(path, isDir)
		const dirent = createSyntheticDirent(name, parentPath, isDir)
		stream.dispatchEvent(new CustomEvent("dirent", { detail: { dirent, match, path } }))
	}

	for (const p of mergedCtx.external.keys()) {
		ctx.external.set(p, mergedCtx.external.get(p)!)
	}
	if (mergedCtx.failed.length > 0) ctx.failed.push(...mergedCtx.failed)

	for (const p of mergedCtx.total.keys()) {
		const t = mergedCtx.total.get(p)!
		const existing = ctx.total.get(p)
		if (!existing) {
			ctx.total.set(p, { ...t })
			continue
		}
		existing.totalMatchedDirs += t.totalMatchedDirs
		existing.totalMatchedFiles += t.totalMatchedFiles
	}
}

/**
 * Patches the {@link MatcherContext} with the given result.
 */
export function walkPatchResult(
	ctx: MatcherContext,
	r: WalkResult,
	options: Required<ScanOptions>,
	stream?: MatcherStream,
): void {
	const { match, path, parentPath, tooDeep, includeParent, isDir, entry, context } = r
	const { dirs, invert } = options

	if (isRuleMatchPattern(match)) ctx.matchedRules.add(match.rule)

	if (isDir && match) {
		const cleanDir = path.endsWith("/") ? path.slice(0, -1) : path
		if (cleanDir && cleanDir !== "." && cleanDir !== "/") ctx.paths.dirs.set(cleanDir, match)
	}

	if (context) patchMerged(ctx, stream, context)
	const shouldPatch = dirs || (!isDir && (entry.isFile() || entry.isSymbolicLink()))
	if (isMatchExcluded(invert, match)) {
		if (isRuleMatchInvalid(match) && stream && shouldPatch) patch(ctx, stream, path, entry, match)
		return
	}
	if (!tooDeep && shouldPatch) patch(ctx, stream, path, entry, match)
	if (includeParent && dirs) patch(ctx, stream, parentPath + "/", entry, match)
}

function addToTotal(
	total: Map<string, Total>,
	dir: string,
	matchedFiles: number,
	matchedDirs: number,
): void {
	const dirTotal = total.get(dir)
	if (!dirTotal) {
		total.set(dir, { totalMatchedDirs: matchedDirs, totalMatchedFiles: matchedFiles })
		return
	}
	dirTotal.totalMatchedFiles += matchedFiles
	dirTotal.totalMatchedDirs += matchedDirs
}

/**
 * Patches the {@link MatcherContext} with the given total.
 */
export function walkPatchTotal(ctx: MatcherContext, maxDepth: number, t: WalkTotal): void {
	if (t.depth <= maxDepth && !t.ignored) addToTotal(ctx.total, t.dir, t.matchedFiles, t.matchedDirs)
}

/**
 * Propagates totals from child directories to their parents.
 */
export function propagateTotals(total: Map<string, Total>): void {
	if (total.size <= 1) return
	const dirs = Array.from(total.keys()).sort((a, b) => b.length - a.length)
	for (let i = 0; i < dirs.length; i++) {
		const dir = dirs[i]!
		if (dir === "." || dir === "/") continue
		const dirTotal = total.get(dir)!
		if (dirTotal.totalMatchedFiles || dirTotal.totalMatchedDirs) {
			addToTotal(total, dirname(dir), dirTotal.totalMatchedFiles, dirTotal.totalMatchedDirs)
		}
	}
}
