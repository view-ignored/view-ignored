import { describe, expect, test } from "bun:test"
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

describe("scripts/create.js", () => {
	test("displays help message when target name is missing or with --help", () => {
		const resHelp = spawnSync("bun", ["scripts/create.js", "--help"], {
			encoding: "utf8",
		})
		expect(resHelp.status).toBe(0)
		expect(resHelp.stdout).toContain("Usage: bun run create <target-name>")

		const resNoArgs = spawnSync("bun", ["scripts/create.js"], {
			encoding: "utf8",
		})
		expect(resNoArgs.status).toBe(0)
		expect(resNoArgs.stdout).toContain("Usage: bun run create <target-name>")
	})

	test("creates a target package inside packages/ directory and updates release workflow", () => {
		const testTargetName = "script-test-target"
		const expectedDir = resolve("packages", "target-script-test-target")
		const workflowPath = resolve(".github/workflows/release.yml")
		const originalWorkflowContent = readFileSync(workflowPath, "utf8")

		try {
			const res = spawnSync("bun", ["scripts/create.js", testTargetName, "--force"], {
				encoding: "utf8",
			})
			expect(res.status).toBe(0)
			expect(res.stdout).toContain("Successfully created monorepo target package")
			expect(existsSync(resolve(expectedDir, "package.json"))).toBe(true)
			expect(existsSync(resolve(expectedDir, "src/index.ts"))).toBe(true)

			const updatedWorkflowContent = readFileSync(workflowPath, "utf8")
			expect(updatedWorkflowContent).toContain("- target-script-test-target")
		} finally {
			if (existsSync(expectedDir)) {
				rmSync(expectedDir, { force: true, recursive: true })
			}
			writeFileSync(workflowPath, originalWorkflowContent, "utf8")
		}
	})
})
