import type { ScanOptions } from "../types.js"
import type { MatcherContext } from "./matcherContext.js"
import type { Resource } from "./resource.js"

import { getOrInsert } from "../mapUtils.js"
import { type ScanParallelOptions } from "../scanParallel.js"
import { scanParallel } from "../scanParallel.js"
import { dirname, unixify } from "../unixify.js"
import {
	walkPatchResult,
	walkPatchTotal,
	propagateTotals,
	type WalkResult,
	type WalkTotal,
	createSyntheticDirent,
} from "../walk.js"
import { type IgnoresOptions } from "./ignores.js"
import { type ResolveSourcesOptions, resolveSources } from "./resolveSources.js"
import { isRuleMatchPattern, type RuleMatch } from "./rule.js"

const promResolve = (options: ResolveSourcesOptions): Promise<Resource> =>
	new Promise((res, rej) => resolveSources(options, (err, r) => (err ? rej(err) : res(r))))

const promIgnores = (options: IgnoresOptions): Promise<RuleMatch> =>
	new Promise((res, rej) => options.target.ignores(options, (err, m) => (err ? rej(err) : res(m))))

const promScanParallel = (options: ScanParallelOptions): Promise<WalkResult[] | null> =>
	new Promise((res, rej) => scanParallel(options, (err, r) => (err ? rej(err) : res(r))))

function parseEntryPath(entry: string) {
	const isDir = entry.endsWith("/")
	const direntPath = isDir ? entry.slice(0, -1) : entry
	const parentPath = dirname(direntPath)
	const idx = direntPath.lastIndexOf("/")
	const name = idx === -1 ? direntPath : direntPath.slice(idx + 1)
	return { direntPath, isDir, name, parentPath }
}

function isExtractorSource(target: { extractors: { path: string }[] }, entry: string): boolean {
	return target.extractors.some(
		({ path }) => (path.startsWith("./") ? path.slice(2) : path) === entry,
	)
}

export async function matcherContextAddPath(
	ctx: MatcherContext,
	options: Required<ScanOptions>,
	entry: string | string[],
): Promise<string[]> {
	if (Array.isArray(entry)) {
		const results = await Promise.all(entry.map((e) => matcherContextAddPath(ctx, options, e)))
		return results.flat()
	}

	const added: string[] = []
	if (ctx.paths.has(entry)) return added

	const { isDir, direntPath, parentPath, name } = parseEntryPath(entry)
	if (isDir && entry === "./") return added

	const { target, fs, cwd, signal, depth: maxDepth } = options

	if (isDir) {
		const resource = await promResolve({
			cwd,
			dir: direntPath,
			external: ctx.external,
			fs,
			signal,
			target,
		})
		const match = await promIgnores({
			cwd,
			dirent: createSyntheticDirent(name, parentPath, true),
			entry: direntPath,
			fs,
			parentPath,
			resource,
			signal,
			target,
		})

		if (isRuleMatchPattern(match)) ctx.matchedRules.add(match.rule)
		ctx.paths.dirs.set(direntPath, match)

		if (!match.ignored && options.dirs && !ctx.paths.has(entry)) {
			ctx.paths.set(entry, match)
			added.push(entry)
		}

		updateTotals(ctx, parentPath, 0, match.ignored ? 0 : 1)
		if (parentPath !== ".")
			added.push(...(await matcherContextAddPath(ctx, options, parentPath + "/")))
		return added
	}

	if (isExtractorSource(target, entry)) {
		const o: ScanParallelOptions = {
			external: ctx.external,
			failed: ctx.failed,
			onResult: (result: WalkResult | WalkTotal) => {
				if ("dir" in result) {
					walkPatchTotal(ctx, maxDepth, result)
					return
				}
				if (!ctx.paths.has(result.path)) added.push(result.path)
				if (result.includeParent && !ctx.paths.has(result.parentPath + "/"))
					added.push(result.parentPath + "/")
				walkPatchResult(ctx, result, options)
			},
			scanOptions: { ...options, within: unixify(parentPath) },
			stream: undefined,
		}
		const resultPromise = promScanParallel(o)
		await matcherContextRemovePath(ctx, options, parentPath + "/")
		await resultPromise
		propagateTotals(ctx.total)
	}

	if (parentPath !== ".")
		added.push(...(await matcherContextAddPath(ctx, options, parentPath + "/")))

	const resource = await promResolve({
		cwd,
		dir: parentPath,
		external: ctx.external,
		fs,
		signal,
		target,
	})
	const match = await promIgnores({
		cwd,
		dirent: createSyntheticDirent(name, parentPath, false),
		entry,
		fs,
		parentPath,
		resource,
		signal,
		target,
	})

	if (isRuleMatchPattern(match)) ctx.matchedRules.add(match.rule)

	updateTotals(ctx, parentPath, match.ignored ? 0 : 1, 0)
	if (!match.ignored && !ctx.paths.has(entry)) {
		ctx.paths.set(entry, match)
		added.push(entry)
	}

	return added
}

export async function matcherContextRemovePath(
	ctx: MatcherContext,
	options: Required<ScanOptions>,
	entry: string | string[],
): Promise<string[]> {
	if (Array.isArray(entry)) {
		const results = await Promise.all(entry.map((e) => matcherContextRemovePath(ctx, options, e)))
		return results.flat()
	}

	const removed: string[] = []
	const { isDir, direntPath, parentPath } = parseEntryPath(entry)
	if (isDir && direntPath === ".") {
		for (const path of ctx.paths.keys()) removed.push(path)
		ctx.paths.clear()
		ctx.external.clear()
		ctx.failed.length = 0
		ctx.matchedRules.clear()
		ctx.total.set(direntPath, { totalMatchedDirs: 0, totalMatchedFiles: 0 })
		return removed
	}

	if (isDir) {
		const total = ctx.total.get(direntPath)
		const files = total?.totalMatchedFiles || 0
		const dirs = total?.totalMatchedDirs || 0
		if (total) ctx.total.delete(direntPath)

		updateTotals(ctx, parentPath, -files, -dirs)

		const entryLen = entry.length
		for (const element of ctx.paths.keys()) {
			if (element.length >= entryLen && element.startsWith(entry)) {
				ctx.paths.delete(element)
				removed.push(element)
			}
		}

		const direntPathLen = direntPath.length
		const direntDir = direntPath + "/"
		for (const element of ctx.paths.dirs.keys()) {
			if (
				element === direntPath ||
				(element.length > direntPathLen && element.startsWith(direntDir))
			) {
				ctx.paths.dirs.delete(element)
			}
		}

		for (const element of ctx.external.keys()) {
			if (
				element.length < direntPathLen ||
				(element !== direntPath && !element.startsWith(direntDir))
			)
				continue

			if (!ctx.external.delete(element) || !ctx.failed.length) continue
			const failedEntryIndex = ctx.failed.findIndex((fail) => dirname(fail.source.path) === element)
			if (failedEntryIndex >= 0) ctx.failed.splice(failedEntryIndex, 1)
		}
		return removed
	}

	if (!isExtractorSource(options.target, entry)) {
		const deleted = ctx.paths.delete(entry)
		if (deleted) removed.push(entry)
		updateTotals(ctx, parentPath, deleted ? -1 : 0, 0)
		return removed
	}

	const maxDepth = options.depth
	const resultPromise = promScanParallel({
		external: ctx.external,
		failed: ctx.failed,
		onResult: (result) => {
			if ("dir" in result) walkPatchTotal(ctx, maxDepth, result)
			else walkPatchResult(ctx, result, options)
		},
		scanOptions: { ...options, within: unixify(parentPath) },
		stream: undefined,
	})
	removed.push(...(await matcherContextRemovePath(ctx, options, parentPath + "/")))
	await resultPromise
	propagateTotals(ctx.total)
	return removed
}

function updateTotals(
	ctx: MatcherContext,
	path: string,
	deltaMatchedFiles: number,
	deltaMatchedDirs: number,
) {
	if (!deltaMatchedFiles && !deltaMatchedDirs) return
	for (let parent = path; ;) {
		const total = getOrInsert(ctx.total, parent, { totalMatchedDirs: 0, totalMatchedFiles: 0 })
		total.totalMatchedFiles += deltaMatchedFiles
		total.totalMatchedDirs += deltaMatchedDirs

		if (parent === "." || parent === "/") break
		parent = dirname(parent)
	}
}
