import { dirname } from "../unixify.js"

export interface GitIndexEntries {
	paths: Set<string>
	dirs: Set<string>
}

const textDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder() : null

function decodeUtf8(buffer: Uint8Array, start: number, end: number): string {
	if (textDecoder) return textDecoder.decode(buffer.subarray(start, end))
	return String.fromCharCode.apply(null, Array.from(buffer.subarray(start, end)))
}

function addAncestors(dirs: Set<string>, path: string): void {
	for (let dir = dirname(path); dir !== "." && dir !== "/" && dir !== ""; dir = dirname(dir)) {
		if (dirs.has(dir)) break
		dirs.add(dir)
	}
}

/**
 * Parses a Git index binary buffer (`.git/index`), supporting index versions 2, 3, and 4.
 * Returns sets of tracked file paths and ancestor directory paths.
 *
 * @since 0.13.0
 */
export function parseGitIndex(buffer: Uint8Array): GitIndexEntries {
	const paths = new Set<string>()
	const dirs = new Set<string>()
	if (!buffer || buffer.length < 12) return { dirs, paths }

	if (buffer[0] !== 0x44 || buffer[1] !== 0x49 || buffer[2] !== 0x52 || buffer[3] !== 0x43)
		return { dirs, paths }

	const version = ((buffer[4]! << 24) | (buffer[5]! << 16) | (buffer[6]! << 8) | buffer[7]!) >>> 0
	if (version < 2 || version > 4) return { dirs, paths }

	const count = ((buffer[8]! << 24) | (buffer[9]! << 16) | (buffer[10]! << 8) | buffer[11]!) >>> 0
	let pos = 12
	let prevPath = ""
	const len = buffer.length

	for (let i = 0; i < count; i++) {
		if (pos + 62 > len) break
		const start = pos
		const flags = (buffer[pos + 60]! << 8) | buffer[pos + 61]!
		pos += 62

		if (version >= 3 && flags & 0x4000) {
			if (pos + 2 > len) break
			pos += 2
		}

		let path = ""
		if (version === 4) {
			let copyLen = 0
			let b = buffer[pos++]!
			copyLen = b & 0x7f
			while (b & 0x80) {
				copyLen = ((copyLen + 1) << 7) | ((b = buffer[pos++]!) & 0x7f)
			}

			let end = pos
			while (end < len && buffer[end] !== 0) end++
			const prefixLen = Math.max(0, prevPath.length - copyLen)
			path = prevPath.slice(0, prefixLen) + decodeUtf8(buffer, pos, end)
			pos = end + 1
			prevPath = path
		} else {
			let end = pos
			while (end < len && buffer[end] !== 0) end++
			path = decodeUtf8(buffer, pos, end)
			const entryLen = end + 1 - start
			pos = end + 1 + ((8 - (entryLen % 8)) % 8)
		}

		if (!path) continue
		paths.add(path)
		addAncestors(dirs, path)
	}

	return { dirs, paths }
}
