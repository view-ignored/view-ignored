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
	path: string
	parentPath: string
	match: RuleMatch
	includeParent = false
	tooDeep = false
	next: 0 | 1 = 0
	depth: number
	isDir: boolean
	entry: Dirent
	context: MatcherContext | null | undefined = undefined

	constructor(
		path: string,
		parentPath: string,
		match: RuleMatch,
		depth: number,
		isDir: boolean,
		entry: Dirent,
		tooDeep = false,
	) {
		this.path = path
		this.parentPath = parentPath
		this.match = match
		this.depth = depth
		this.isDir = isDir
		this.entry = entry
		this.tooDeep = tooDeep
	}
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
	const isExcluded = isMatchExcluded(invert, match)
	const direntPath = isDir ? path + "/" : path

	const result = new WalkResult(direntPath, parentPath, match, depth, isDir, entry, tooDeepFlag)

	if (isRuleMatchInvalid(match)) return result
	if (isExcluded) {
		if (
			isDir &&
			match.ignored &&
			match.kind !== RuleMatchKind.noMatch &&
			(match.kind !== RuleMatchKind.external || match.source?.spec === PatternSpec.gitignore)
		)
			result.next = 1

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
	runIgnoresSync: () => WalkResult,
): WalkResult {
	if (resolvedCtx === null) return runIgnoresSync()
	const { entry, relPath: path, parentPath, depth } = options
	const res = new WalkResult(path + "/", parentPath, ruleMatchIgnoredNone, depth, true, entry)
	res.context = resolvedCtx === 0 ? null : resolvedCtx
	res.next = 1
	return res
}

function throwErrorCallback(err: Error): never {
	throw err
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

	const len = list.length
	for (let i = 0; i < len; i++) {
		const rule = list[i]!
		if (typeof rule !== "function") continue

		ignoreOptions ??= {
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

		if (res && typeof (res as Promise<unknown>).then === "function")
			return (res as Promise<MatcherContext | 0 | null>).then(
				(resolvedCtx) =>
					handleRuleResolvedCtx(resolvedCtx, options, () => runIgnoresSync(options, isDir)),
				throwErrorCallback,
			)
		const walkRes = new WalkResult(path + "/", parentPath, ruleMatchIgnoredNone, depth, true, entry)
		walkRes.context = res === 0 ? null : (res as MatcherContext)
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

	if (!isDir) return runIgnoresSync(options, isDir)

	const { internalRules } = target
	if (!internalRules) return runIgnoresSync(options, isDir)

	const isArr = Array.isArray(internalRules)
	const list1 = isArr ? (internalRules as Rule[]) : (internalRules as InternalRules).before
	const list2 = isArr ? null : (internalRules as InternalRules).after

	const res1 = checkRulesList(list1, options, maxDepth, isDir)
	if (res1 !== null) return res1

	const res2 = checkRulesList(list2, options, maxDepth, isDir)
	if (res2 !== null) return res2

	return runIgnoresSync(options, isDir)
}

abstract class BaseSyntheticDirent {
	name: string
	parentPath: string

	constructor(name: string, parentPath: string) {
		this.name = name
		this.parentPath = parentPath
	}

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
	return (isDir
		? new SyntheticDirDirent(name, parentPath)
		: new SyntheticFileDirent(name, parentPath)) as unknown as Dirent
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
		const cleanPath = path.slice(0, -1)
		const lastSlash = cleanPath.lastIndexOf("/")
		const parentPath = lastSlash === -1 ? "." : cleanPath.slice(0, lastSlash)
		const name = lastSlash === -1 ? cleanPath : cleanPath.slice(lastSlash + 1)
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
	for (const rule of mergedCtx.matchedRules) {
		ctx.matchedRules.add(rule)
	}

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
		const cleanPath = isDir ? path.slice(0, -1) : path
		const lastSlash = cleanPath.lastIndexOf("/")
		const parentPath = lastSlash === -1 ? "." : cleanPath.slice(0, lastSlash)
		const name = lastSlash === -1 ? cleanPath : cleanPath.slice(lastSlash + 1)
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
		if (cleanDir && cleanDir !== "." && cleanDir !== "/") {
			ctx.paths.dirs.set(cleanDir, match)
		}
	}

	const isExcluded = isMatchExcluded(invert, match)
	if (context) patchMerged(ctx, stream, context)
	const shouldPatch = dirs || (!isDir && (entry.isFile() || entry.isSymbolicLink()))
	if (isExcluded) {
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
		total.set(dir, {
			totalMatchedDirs: matchedDirs,
			totalMatchedFiles: matchedFiles,
		})
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
	const dirs = Array.from(total.keys())
	dirs.sort((a, b) => b.length - a.length)
	for (let i = 0, len = dirs.length; i < len; i++) {
		const dir = dirs[i]!
		if (dir === "." || dir === "/") continue
		const dirTotal = total.get(dir)!
		const files = dirTotal.totalMatchedFiles
		const subdirs = dirTotal.totalMatchedDirs
		if (files === 0 && subdirs === 0) continue
		addToTotal(total, dirname(dir), files, subdirs)
	}
}
