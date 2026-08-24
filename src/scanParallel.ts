import type { Dirent, Stats } from "node:fs"

import type { MatcherStream } from "./patterns/matcherStream.js"
import type { Resource, InvalidSource } from "./patterns/resource.js"
import type { ScanOptions } from "./types.js"

import { resolveSources } from "./patterns/resolveSources.js"
import { isRuleMatchInvalid } from "./patterns/rule.js"
import { countSlashes, dirname, ffalse, join } from "./unixify.js"
import { walkIncludes, type WalkResult, type WalkTotal } from "./walk.js"

export interface ScanParallelOptions {
	scanOptions: Required<ScanOptions>
	stream?: MatcherStream
	external: Map<string, Resource>
	failed?: InvalidSource[]
	onResult?: (result: WalkResult | WalkTotal) => void
}

interface ScanState {
	activeTasks: number
	errorOccurred: Error | null
	results: WalkResult[] | null
}

function processSingleFile(
	within: string,
	stat: Stats,
	options: ScanParallelOptions,
	state: ScanState,
	handleError: (err: Error) => void,
	taskDone: () => void,
) {
	const { scanOptions, external, failed, onResult, stream } = options
	const { invert, signal } = scanOptions

	if (state.errorOccurred || signal?.aborted) {
		taskDone()
		return
	}

	const parentPath = dirname(within)
	const lastSlash = within.lastIndexOf("/")
	const name = lastSlash === -1 ? within : within.slice(lastSlash + 1)

	const depth = parentPath !== "." && parentPath !== "" ? 1 + countSlashes(parentPath) : 0

	const entry = {
		isBlockDevice: typeof stat.isBlockDevice === "function" ? () => stat.isBlockDevice() : ffalse,
		isCharacterDevice:
			typeof stat.isCharacterDevice === "function" ? () => stat.isCharacterDevice() : ffalse,
		isDirectory: () => false,
		isFIFO: typeof stat.isFIFO === "function" ? () => stat.isFIFO() : ffalse,
		isFile: typeof stat.isFile === "function" ? () => stat.isFile() : ffalse,
		isSocket: typeof stat.isSocket === "function" ? () => stat.isSocket() : ffalse,
		isSymbolicLink:
			typeof stat.isSymbolicLink === "function" ? () => stat.isSymbolicLink() : ffalse,
		name,
		parentPath,
	} as Dirent

	resolveSources(
		{
			cwd: scanOptions.cwd,
			dir: parentPath,
			entries: undefined,
			external,
			fs: scanOptions.fs,
			resource: undefined,
			signal: scanOptions.signal,
			target: scanOptions.target,
		},
		(err, res) => {
			if (state.errorOccurred || signal?.aborted) {
				taskDone()
				return
			}

			if (err) {
				handleError(err)
				taskDone()
				return
			}

			if (res && "error" in res && res.error) {
				if (!failed) {
					handleError(res.error)
					taskDone()
					return
				}
				failed.push(res)
			}

			const selfOrPromise = walkIncludes({
				depth,
				entry,
				parentPath,
				relPath: within,
				resource: res,
				scanOptions,
				stream,
			})

			const handleResult = (self: WalkResult | null) => {
				if (state.errorOccurred || signal?.aborted) {
					taskDone()
					return
				}

				if (self && self.match) {
					let dirMatchedFiles = 0
					const isIncluded = isRuleMatchInvalid(self.match)
						? false
						: invert === true
							? self.match.ignored
							: invert === 2
								? true
								: !self.match.ignored

					if ((entry.isFile() || entry.isSymbolicLink()) && isIncluded) dirMatchedFiles = 1

					if (onResult) {
						onResult(self)
						onResult({
							depth,
							dir: parentPath,
							ignored: false,
							matchedDirs: 0,
							matchedFiles: dirMatchedFiles,
						})
					} else if (state.results) state.results.push(self)
				}
				taskDone()
			}

			if (selfOrPromise instanceof Promise) {
				selfOrPromise.then(
					(self) => handleResult(self),
					(err) => {
						handleError(err)
						taskDone()
					},
				)
			} else handleResult(selfOrPromise)
		},
	)
}

function processEntries(
	relPath: string,
	depth: number,
	entries: Dirent[],
	res: Resource | null,
	options: ScanParallelOptions,
	state: ScanState,
	walk: (relPath: string, depth: number, resource?: Resource) => void,
	handleError: (err: Error) => void,
	taskDone: () => void,
) {
	const { scanOptions, stream, failed, onResult } = options
	const { invert, signal } = scanOptions

	if (state.errorOccurred || signal?.aborted) return

	if (res && "error" in res && res.error) {
		if (!failed) return handleError(res.error)
		failed.push(res)
	}

	const len = entries.length
	const prefix = relPath === "." || relPath === "" ? "" : relPath + "/"

	let pendingResults = len
	let dirMatchedFiles = 0
	let dirMatchedDirs = 0

	if (len === 0 && onResult)
		onResult({ depth, dir: relPath, ignored: false, matchedDirs: 0, matchedFiles: 0 })

	const handleResult = (self: WalkResult | null, entry: Dirent, currentRelPath: string) => {
		const finish = () => {
			pendingResults--
			if (pendingResults === 0 && onResult && !state.errorOccurred && !signal?.aborted) {
				onResult({
					depth,
					dir: relPath,
					ignored: false,
					matchedDirs: dirMatchedDirs,
					matchedFiles: dirMatchedFiles,
				})
			}
			taskDone()
		}

		if (state.errorOccurred || signal?.aborted) return finish()

		if (!self || !self.match) return finish()

		const isIncluded = isRuleMatchInvalid(self.match)
			? false
			: invert === true
				? self.match.ignored
				: invert === 2
					? true
					: !self.match.ignored

		if (self.isDir && isIncluded) dirMatchedDirs++
		else if ((entry.isFile() || entry.isSymbolicLink()) && isIncluded) dirMatchedFiles++

		if (onResult) onResult(self)
		else state.results!.push(self)

		if (self.isDir && self.next === 0) walk(currentRelPath, depth + 1, res)
		finish()
	}

	for (let i = 0; i < len; i++) {
		if (state.errorOccurred || signal?.aborted) break
		const entry = entries[i]!
		state.activeTasks++
		const { name } = entry
		const currentRelPath = prefix + name

		const selfOrPromise = walkIncludes({
			depth,
			entry,
			parentPath: relPath,
			relPath: currentRelPath,
			resource: res,
			scanOptions,
			stream,
		})

		if (selfOrPromise instanceof Promise) {
			selfOrPromise.then(
				(self) => handleResult(self, entry, currentRelPath),
				(err) => handleError(err),
			)
		} else handleResult(selfOrPromise, entry, currentRelPath)
	}
	taskDone()
}

/**
 * Executes a parallel directory scan.
 *
 * @since 0.11.0
 */
export function scanParallel(
	options: ScanParallelOptions,
	cb: (err: Error | null, results: WalkResult[] | null) => void,
): void {
	const { scanOptions, external, onResult } = options
	const { within, signal } = scanOptions

	const state: ScanState = {
		activeTasks: 0,
		errorOccurred: null,
		results: onResult ? null : [],
	}

	const removeAbortListener = () => {
		if (signal) signal.removeEventListener("abort", onAbort)
	}

	const handleError = (err: Error) => {
		if (state.errorOccurred) return
		state.errorOccurred = err
		removeAbortListener()
		cb(err, null)
	}

	const onAbort = () => {
		handleError((signal?.reason as Error) ?? new Error("Aborted"))
	}

	if (signal) {
		if (signal.aborted) {
			handleError((signal.reason as Error) ?? new Error("Aborted"))
			return
		}
		signal.addEventListener("abort", onAbort, { once: true })
	}

	const taskDone = () => {
		state.activeTasks--
		if (state.activeTasks === 0 && !state.errorOccurred) {
			removeAbortListener()
			cb(null, state.results)
		}
	}

	const handleReaddir = (
		err: Error | null,
		entries: Dirent[],
		relPath: string,
		depth: number,
		resource?: Resource,
	) => {
		if (state.errorOccurred || signal?.aborted) {
			taskDone()
			return
		}

		if (err) {
			handleError(err)
			taskDone()
			return
		}

		resolveSources(
			{
				cwd: scanOptions.cwd,
				dir: relPath,
				entries,
				external,
				fs: scanOptions.fs,
				resource,
				signal: scanOptions.signal,
				target: scanOptions.target,
			},
			(err, res) => handleResolveSources(err, res, relPath, depth, entries),
		)
	}

	const handleResolveSources = (
		err: Error | null,
		res: Resource | null,
		relPath: string,
		depth: number,
		entries: Dirent[],
	) => {
		if (state.errorOccurred || signal?.aborted) {
			taskDone()
			return
		}

		if (err) {
			handleError(err)
			taskDone()
			return
		}
		processEntries(relPath, depth, entries, res, options, state, walk, handleError, taskDone)
	}

	const walk = (relPath: string, depth: number, resource?: Resource) => {
		if (state.errorOccurred || signal?.aborted) return
		state.activeTasks++

		scanOptions.fs.readdir(
			join(scanOptions.cwd, relPath),
			{ withFileTypes: true },
			(err, entries) => handleReaddir(err, entries, relPath, depth, resource),
		)
	}

	const withinList = Array.isArray(within) ? within : [within]
	if (withinList.length === 0) {
		cb(null, state.results)
		return
	}

	for (let i = 0; i < withinList.length; i++) {
		const item = withinList[i]!
		const initialDepth = item !== "." && item !== "" ? countSlashes(item) : 0

		if (item !== "." && item !== "" && !item.endsWith("/")) {
			state.activeTasks++
			scanOptions.fs.stat(join(scanOptions.cwd, item), (err, stat) => {
				if (err) {
					handleError(err)
					taskDone()
					return
				}
				if (stat.isDirectory()) {
					walk(item, initialDepth, undefined)
					taskDone()
					return
				}
				processSingleFile(item, stat as Stats, options, state, handleError, taskDone)
			})
		} else walk(item, initialDepth, undefined)
	}
}
