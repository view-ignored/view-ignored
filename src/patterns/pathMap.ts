import type { RuleMatch } from "./rule.js"

import { dirname } from "../unixify.js"

export class PathMap extends Map<string, RuleMatch> {
	dirs: Map<string, RuleMatch> = new Map<string, RuleMatch>()

	override get(key: string): RuleMatch | undefined {
		const direct = super.get(key)
		if (direct !== undefined) return direct

		if (!this.dirs.size) return undefined

		const isExplicitDir = key.endsWith("/")
		const cleanKey = isExplicitDir ? key.slice(0, -1) : key
		if (cleanKey === "" || cleanKey === ".") return undefined

		if (isExplicitDir) {
			let match = this.dirs.get(cleanKey)
			if (match === undefined) match = this.dirs.get(cleanKey + "/")
			if (match !== undefined) return match
		}

		for (let dir = dirname(cleanKey); ;) {
			if (dir === "." || dir === "/" || dir === "") break

			let match = this.dirs.get(dir)
			if (match === undefined) match = this.dirs.get(dir + "/")
			if (match !== undefined) return match

			if (!dir.includes("/")) break
			const parent = dirname(dir)
			if (parent === dir) break
			dir = parent
		}

		return undefined
	}

	override clear(): void {
		super.clear()
		this.dirs.clear()
	}
}
