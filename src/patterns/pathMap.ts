import type { RuleMatch } from "./rule.js"

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
			const match = this.dirs.get(cleanKey) ?? this.dirs.get(cleanKey + "/")
			if (match !== undefined) return match
		}

		let slashIndex = cleanKey.lastIndexOf("/")
		while (slashIndex > 0) {
			const dir = cleanKey.slice(0, slashIndex)
			const match = this.dirs.get(dir) ?? this.dirs.get(dir + "/")
			if (match !== undefined) return match
			slashIndex = cleanKey.lastIndexOf("/", slashIndex - 1)
		}

		return undefined
	}

	override clear(): void {
		super.clear()
		this.dirs.clear()
	}
}
