import type { SkipRule } from "./rule.js"

let cachedGitSkipRule: SkipRule | null = null

/**
 * Creates and caches a {@link SkipRule} that skips `.git` directories.
 *
 * @since 0.13.0
 */
export function makeGitSkipRule(): SkipRule {
	return (cachedGitSkipRule ||= ({ dirent }) => {
		if (dirent.isDirectory() && dirent.name === ".git") return 0
		return null
	})
}
