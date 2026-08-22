import { describe, expect, test } from "bun:test"
import { spawnSync } from "node:child_process"
import { existsSync, rmSync } from "node:fs"
import { resolve } from "node:path"

describe("scripts/create.js", () => {
	test("displays help message with --help", () => {
		const res = spawnSync("bun", ["scripts/create.js", "--help"], {
			encoding: "utf8",
		})
		expect(res.status).toBe(0)
		expect(res.stdout).toContain("Usage: bun run create <target-name>")
	})

	test("creates a target package inside packages/ directory", () => {
		const testTargetName = "script-test-target"
		const expectedDir = resolve("packages", "target-script-test-target")

		try {
			const res = spawnSync("bun", ["scripts/create.js", testTargetName, "--force"], {
				encoding: "utf8",
			})
			expect(res.status).toBe(0)
			expect(res.stdout).toContain("Successfully created monorepo target package")
			expect(existsSync(resolve(expectedDir, "package.json"))).toBe(true)
			expect(existsSync(resolve(expectedDir, "src/index.ts"))).toBe(true)
		} finally {
			if (existsSync(expectedDir)) {
				rmSync(expectedDir, { force: true, recursive: true })
			}
		}
	})
})
