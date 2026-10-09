import type { Dirent } from "node:fs"

import type { MatcherStream } from "./patterns/matcherStream.js"
import type { Resource, InvalidSource } from "./patterns/resource.js"
import type { ScanOptions } from "./types.js"

import { resolveSources } from "./patterns/resolveSources.js"
import { countSlashes, join } from "./unixify.js"
import {
	createSyntheticDirent,
	isMatchIncluded,
	walkIncludes,
	type WalkResult,
	type WalkTotal,
} from "./walk.js"

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
	options: ScanParallelOptions,
	state: ScanState,
	handleError: (err: Error) => void,
	taskDone: () => void,
) {
	const { scanOptions, external, failed, onResult, stream } = options
	const { invert, signal } = scanOptions

	if (state.errorOccurred || signal?.aborted) return taskDone()

	const lastSlash = within.lastIndexOf("/")
	const parentPath = lastSlash === -1 ? "." : within.slice(0, lastSlash)
	const name = lastSlash === -1 ? within : within.slice(lastSlash + 1)
	const depth = lastSlash === -1 ? 0 : countSlashes(within)
	const entry = createSyntheticDirent(name, parentPath, false)

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
			if (state.errorOccurred || signal?.aborted) return taskDone()
			if (err) {
				handleError(err)
				return taskDone()
			}

			if (res && "error" in res && res.error) {
				if (!failed) {
					handleError(res.error)
					return taskDone()
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
				if (state.errorOccurred || signal?.aborted) return taskDone()

				if (self?.match) {
					const isIncluded = isMatchIncluded(self.match, invert)
					const dirMatchedFiles = (entry.isFile() || entry.isSymbolicLink()) && isIncluded ? 1 : 0

					if (onResult) {
						onResult(self)
						onResult({
							depth,
							dir: parentPath,
							ignored: false,
							matchedDirs: 0,
							matchedFiles: dirMatchedFiles,
						})
					} else state.results?.push(self)
				}
				taskDone()
			}

			if (selfOrPromise instanceof Promise) {
				selfOrPromise.then(handleResult, (e) => {
					handleError(e)
					taskDone()
				})
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
			if (--pendingResults === 0 && onResult && !state.errorOccurred && !signal?.aborted) {
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

		if (state.errorOccurred || signal?.aborted || !self?.match) return finish()

		const isIncluded = isMatchIncluded(self.match, invert)
		if (self.isDir && isIncluded) dirMatchedDirs++
		else if ((entry.isFile() || entry.isSymbolicLink()) && isIncluded) dirMatchedFiles++

		if (onResult) onResult(self)
		else state.results?.push(self)

		if (self.isDir && self.next === 0) walk(currentRelPath, depth + 1, res)
		finish()
	}

	for (let i = 0; i < len; i++) {
		if (state.errorOccurred || signal?.aborted) break
		const entry = entries[i]!
		state.activeTasks++
		const currentRelPath = prefix + entry.name

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
			selfOrPromise.then((self) => handleResult(self, entry, currentRelPath), handleError)
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

	const state: ScanState = { activeTasks: 0, errorOccurred: null, results: onResult ? null : [] }

	const removeAbortListener = () => {
		signal?.removeEventListener("abort", onAbort)
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
		if (signal.aborted) return handleError((signal.reason as Error) ?? new Error("Aborted"))
		signal.addEventListener("abort", onAbort, { once: true })
	}

	const taskDone = () => {
		if (--state.activeTasks === 0 && !state.errorOccurred) {
			removeAbortListener()
			cb(null, state.results)
		}
	}

	const walk = (relPath: string, depth: number, resource?: Resource) => {
		if (state.errorOccurred || signal?.aborted) return
		state.activeTasks++

		scanOptions.fs.readdir(
			join(scanOptions.cwd, relPath),
			{ withFileTypes: true },
			(err, entries) => {
				if (state.errorOccurred || signal?.aborted) return taskDone()
				if (err) {
					handleError(err)
					return taskDone()
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
					(err, res) => {
						if (state.errorOccurred || signal?.aborted) return taskDone()
						if (err) {
							handleError(err)
							return taskDone()
						}
						processEntries(
							relPath,
							depth,
							entries,
							res,
							options,
							state,
							walk,
							handleError,
							taskDone,
						)
					},
				)
			},
		)
	}

	const withinList = Array.isArray(within) ? within : [within]
	if (withinList.length === 0) return cb(null, state.results)

	for (let i = 0; i < withinList.length; i++) {
		const item = withinList[i]!
		const initialDepth = item !== "." && item !== "" ? countSlashes(item) : 0

		if (item !== "." && item !== "" && !item.endsWith("/")) {
			state.activeTasks++
			scanOptions.fs.stat(join(scanOptions.cwd, item), (err, stat) => {
				if (err) {
					handleError(err)
					return taskDone()
				}
				if (stat.isDirectory()) {
					walk(item, initialDepth, undefined)
					taskDone()
					return
				}
				processSingleFile(item, options, state, handleError, taskDone)
			})
		} else walk(item, initialDepth, undefined)
	}
}
