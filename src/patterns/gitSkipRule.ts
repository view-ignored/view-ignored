import type { SkipRule } from "./rule.js"

let cachedGitSkipRule: SkipRule | null = null

/**
 * Creates and caches a {@link SkipRule} that skips `.git` directories.
 *
 * @since 0.12.4
 */
export function makeGitSkipRule(): SkipRule {
	return (cachedGitSkipRule ||= (options) => {
		if (options.dirent.isDirectory() && options.dirent.name === ".git") return 0
		return null
	})
}
