import { afterEach, describe, expect, test } from "bun:test"
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { createTargetPackage, runCli } from "./index.js"

describe("@view-ignored/create generator", () => {
	const tempDirs: string[] = []

	function makeTmpDir(): string {
		const dir = mkdtempSync(join(tmpdir(), "vign-create-test-"))
		tempDirs.push(dir)
		return dir
	}

	afterEach(() => {
		for (const dir of tempDirs) {
			if (existsSync(dir)) {
				rmSync(dir, { force: true, recursive: true })
			}
		}
		tempDirs.length = 0
	})

	test("creates target package with default options and version sub-exports", () => {
		const rootTmp = makeTmpDir()
		const targetDir = join(rootTmp, "target-custom")

		const res = createTargetPackage({ targetDir })
		expect(res.packageName).toBe("@view-ignored/target-custom")
		expect(res.functionName).toBe("makeCustom")
		expect(res.files).toContain("package.json")
		expect(res.files).toContain("src/index.ts")
		expect(res.files).toContain("src/v0.ts")
		expect(res.files).toContain("src/v1.ts")

		const pkgJson = JSON.parse(readFileSync(join(targetDir, "package.json"), "utf8"))
		expect(pkgJson.name).toBe("@view-ignored/target-custom")
		expect(pkgJson.peerDependencies["view-ignored"]).toBe("*")
		expect(pkgJson.exports["."]).toBeDefined()
		expect(pkgJson.exports["./v0"]).toBeDefined()
		expect(pkgJson.exports["./v1"]).toBeDefined()

		const v0Ts = readFileSync(join(targetDir, "src/v0.ts"), "utf8")
		expect(v0Ts).toContain("export function makeCustomV0(options: CustomV0Options = {}): Target")
		expect(v0Ts).toContain("function parseSemver")

		const v1Ts = readFileSync(join(targetDir, "src/v1.ts"), "utf8")
		expect(v1Ts).toContain("export function makeCustomV1(options: CustomV1Options = {}): Target")
		expect(v1Ts).toContain("function parseSemver")
	})

	test("creates target package with custom name and scope", () => {
		const rootTmp = makeTmpDir()
		const targetDir = join(rootTmp, "my-target")

		const res = createTargetPackage({
			name: "awesome-tool",
			targetDir,
		})
		expect(res.packageName).toBe("@view-ignored/target-awesome-tool")
		expect(res.functionName).toBe("makeAwesomeTool")

		const pkgJson = JSON.parse(readFileSync(join(targetDir, "package.json"), "utf8"))
		expect(pkgJson.name).toBe("@view-ignored/target-awesome-tool")

		const indexTs = readFileSync(join(targetDir, "src/v1.ts"), "utf8")
		expect(indexTs).toContain(
			"export function makeAwesomeToolV1(options: AwesomeToolV1Options = {}): Target",
		)
		expect(indexTs).toContain(".awesometoolignore")
	})

	test("throws error when package.json exists unless force is used", () => {
		const rootTmp = makeTmpDir()
		const targetDir = join(rootTmp, "existing")

		createTargetPackage({ targetDir })

		expect(() => createTargetPackage({ targetDir })).toThrow("already contains a package.json")

		expect(() => createTargetPackage({ force: true, targetDir })).not.toThrow()
	})

	test("runCli displays help with --help", () => {
		const logs: string[] = []
		const origLog = console.log
		console.log = (...args: unknown[]) => {
			logs.push(args.join(" "))
		}

		try {
			runCli(["--help"])
			expect(logs.join("\n")).toContain("Usage: create-view-ignored")
		} finally {
			console.log = origLog
		}
	})

	test("runCli creates target package from CLI positional args", () => {
		const rootTmp = makeTmpDir()
		const targetDir = join(rootTmp, "cli-target")

		const logs: string[] = []
		const origLog = console.log
		console.log = (...args: unknown[]) => {
			logs.push(args.join(" "))
		}

		try {
			runCli(["my-cli-target", targetDir])
			expect(logs.join("\n")).toContain("Successfully created target package")
			expect(existsSync(join(targetDir, "package.json"))).toBe(true)
		} finally {
			console.log = origLog
		}
	})
})
