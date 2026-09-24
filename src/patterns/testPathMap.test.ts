import { describe, test, expect } from "bun:test"
import { Volume } from "memfs"

import { scan } from "../scan.js"
import { makeGit } from "../targets/git.js"
import { createAdapter } from "../testScan.test.js"
import { PathMap } from "./pathMap.js"
import { RuleMatchKind, type RuleMatch } from "./rule.js"

describe("PathMap", () => {
	test("direct get/set behavior", () => {
		const map = new PathMap()
		const match: RuleMatch = { ignored: false, kind: RuleMatchKind.none }

		map.set("src/file.ts", match)
		expect(map.get("src/file.ts")).toBe(match)
		expect(map.get("src/other.ts")).toBeUndefined()
	})

	test("fallback to dirs for nested child paths", () => {
		const map = new PathMap()
		const gitMatch: RuleMatch = { ignored: true, kind: RuleMatchKind.none }
		const srcSubMatch: RuleMatch = { ignored: false, kind: RuleMatchKind.none }

		map.dirs.set(".git", gitMatch)
		map.dirs.set("src/sub", srcSubMatch)

		// Direct lookup for .git/something/something falls back to .git in dirs
		expect(map.get(".git/config")).toBe(gitMatch)
		expect(map.get(".git/objects/pack/pack-123.pack")).toBe(gitMatch)

		// Direct lookup for src/sub/deep/file.ts falls back to src/sub in dirs
		expect(map.get("src/sub/deep/file.ts")).toBe(srcSubMatch)

		// Paths outside registered dirs return undefined
		expect(map.get("src/file.ts")).toBeUndefined()
		expect(map.get("other/file.ts")).toBeUndefined()
	})

	test("dirs with trailing slash", () => {
		const map = new PathMap()
		const match: RuleMatch = { ignored: true, kind: RuleMatchKind.none }

		map.dirs.set(".git/", match)
		expect(map.get(".git/config")).toBe(match)
		expect(map.get(".git/something/something")).toBe(match)
	})

	test("clear empties both main map and dirs", () => {
		const map = new PathMap()
		const match: RuleMatch = { ignored: false, kind: RuleMatchKind.none }

		map.set("a.txt", match)
		map.dirs.set("dir", match)

		expect(map.size).toBe(1)
		expect(map.dirs.size).toBe(1)

		map.clear()

		expect(map.size).toBe(0)
		expect(map.dirs.size).toBe(0)
		expect(map.get("a.txt")).toBeUndefined()
		expect(map.get("dir/file.txt")).toBeUndefined()
	})

	test("SkipRule for .git directory enables paths.get('.git/something/something') => ignored", async () => {
		const vol = Volume.fromNestedJSON(
			{
				".git": {
					config: "core",
					objects: {
						pack: {
							"pack-123.pack": "binary",
						},
					},
				},
				"index.js": "console.log('hello')",
			},
			"/test-repo",
		)
		const adapter = createAdapter(vol)

		const ctx = await scan({
			cwd: "/test-repo",
			depth: Infinity,
			dirs: false,
			fs: adapter,
			target: makeGit(),
		})

		// .git was skipped by SkipRule during scan
		expect(ctx.paths.dirs.has(".git")).toBeTrue()

		// Nested paths under .git fall back to .git dir match and return ignored: true
		const gitConfigMatch = ctx.paths.get(".git/config")
		expect(gitConfigMatch).toBeDefined()
		expect(gitConfigMatch?.ignored).toBeTrue()

		const nestedGitMatch = ctx.paths.get(".git/objects/pack/pack-123.pack")
		expect(nestedGitMatch).toBeDefined()
		expect(nestedGitMatch?.ignored).toBeTrue()

		// Non-ignored file returns its actual match
		const indexMatch = ctx.paths.get("index.js")
		expect(indexMatch).toBeDefined()
		expect(indexMatch?.ignored).toBeFalse()
	})
})
