#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { basename, resolve } from "node:path"
import { fileURLToPath } from "node:url"

export interface CreateTargetPackageOptions {
	/**
	 * Overwrite existing directory if it is not empty.
	 */
	force?: boolean
	/**
	 * Name of the target or package.
	 */
	name?: string
	/**
	 * Output target directory path.
	 */
	targetDir?: string
}

export interface CreateTargetPackageResult {
	/**
	 * Created directory path.
	 */
	dir: string
	/**
	 * List of created files.
	 */
	files: string[]
	/**
	 * Target function export name (e.g. `makeCustom`).
	 */
	functionName: string
	/**
	 * Package name (e.g. `view-ignored-target-custom`).
	 */
	packageName: string
}

function toPascalCase(str: string): string {
	const cleaned = str.replace(/^@/, "").replace(/[^a-zA-Z0-9]+/g, " ")
	return cleaned
		.split(" ")
		.filter((word) => word.length > 0)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join("")
}

function normalizePackageName(rawName: string): string {
	const trimmed = rawName.trim().toLowerCase()
	if (!trimmed) return "@view-ignored/target-custom"
	if (trimmed.startsWith("@") || trimmed.includes("view-ignored")) return trimmed
	return `@view-ignored/target-${trimmed}`
}

function normalizeTargetName(rawName: string): string {
	const name = rawName.trim()
	if (!name) return "Custom"
	const withoutScope = name.startsWith("@") ? name.split("/")[1] || name : name
	const withoutPrefix = withoutScope.replace(/^target-/, "").replace(/^view-ignored-/, "")
	return toPascalCase(withoutPrefix) || "Custom"
}

export function createTargetPackage(
	options: CreateTargetPackageOptions = {},
): CreateTargetPackageResult {
	const rawName = options.name || "custom"
	const packageName = normalizePackageName(rawName)
	const targetName = normalizeTargetName(rawName)
	const functionName = `make${targetName}`

	const outputDir = resolve(options.targetDir || packageName)

	if (existsSync(outputDir) && !options.force) {
		const isPackageJsonExist = existsSync(resolve(outputDir, "package.json"))
		if (isPackageJsonExist) {
			throw new Error(
				`Directory "${outputDir}" already contains a package.json. Use force option to overwrite.`,
			)
		}
	}

	mkdirSync(resolve(outputDir, "src"), { recursive: true })

	const packageJsonContent = JSON.stringify(
		{
			description: `view-ignored target plugin for ${targetName}.`,
			devDependencies: {
				"@types/bun": "latest",
				"@types/node": "latest",
				oxfmt: "latest",
				oxlint: "latest",
				publint: "latest",
				typescript: "latest",
				"view-ignored": "latest",
			},
			engines: {
				node: ">=22",
			},
			exports: {
				".": {
					default: "./out/index.js",
					types: "./out/index.d.ts",
				},
				"./v0": {
					default: "./out/v0.js",
					types: "./out/v0.d.ts",
				},
				"./v1": {
					default: "./out/v1.js",
					types: "./out/v1.d.ts",
				},
			},
			keywords: ["view-ignored", "target", targetName.toLowerCase()],
			license: "MIT",
			name: packageName,
			peerDependencies: {
				"view-ignored": "*",
			},
			scripts: {
				check: "bun tsc -p src --noEmit",
				dev: "bun tsc -p src",
				fmt: "bun run oxfmt",
				lint: "bun run oxlint --type-aware",
				prod: "rm -rf out && bun tsc -p src/tsconfig.prod.json --emitDeclarationOnly && bun tsc -p src/tsconfig.prod.json --removeComments -d false && oxfmt && oxfmt ./out/**",
				publint: "publint",
				test: "bun test --timeout 5000 src",
			},
			type: "module",
			version: "0.1.0",
		},
		null,
		"\t",
	)

	const indexTsContent = `export * from "./v1.js"
export { ${functionName}V1 as ${functionName} } from "./v1.js"
`

	const v0TsContent = `import type { Target } from "view-ignored/targets"

import { extractIgnores, ruleCompile, ruleTest, type Extractor, type Rule } from "view-ignored/patterns"

export interface ${targetName}V0Options {
	/**
	 * Execution mode (e.g. "list" | "publish").
	 */
	mode?: string
	/**
	 * Tool version (e.g. "0.5.0").
	 */
	version?: string
}

function parseSemver(version: string): [number, number, number] {
	const cleaned = version.replace(/^v/, "").trim()
	const parts = cleaned.split(".").map((num) => parseInt(num, 10) || 0)
	return [parts[0] || 0, parts[1] || 0, parts[2] || 0]
}

function isVersionGte(version: string, targetVersion: string): boolean {
	const [aMajor, aMinor, aPatch] = parseSemver(version)
	const [bMajor, bMinor, bPatch] = parseSemver(targetVersion)

	if (aMajor !== bMajor) return aMajor > bMajor
	if (aMinor !== bMinor) return aMinor > bMinor
	return aPatch >= bPatch
}

/**
 * Creates a view-ignored target for ${targetName} (v0.x compatibility).
 */
export function ${functionName}V0(options: ${targetName}V0Options = {}): Target {
	const mode = options.mode || "publish"
	const version = options.version || "0.5.0"

	const extractors: Extractor[] = [
		{
			extract: extractIgnores,
			path: ".${targetName.toLowerCase()}ignore",
		},
	]

	const internalRules: Rule[] = [
		ruleCompile({
			compiled: null,
			excludes: true,
			list: isVersionGte(version, "0.5.0") ? [".git", "node_modules"] : [".git"],
		}),
	]

	return {
		extractors,
		ignores: ruleTest,
		internalRules,
		root: ".",
	}
}
`

	const v1TsContent = `import type { Target } from "view-ignored/targets"

import { extractIgnores, ruleCompile, ruleTest, type Extractor, type Rule } from "view-ignored/patterns"

export interface ${targetName}V1Options {
	/**
	 * Execution mode (e.g. "list" | "publish").
	 */
	mode?: string
	/**
	 * Tool version (e.g. "1.0.0").
	 */
	version?: string
}

function parseSemver(version: string): [number, number, number] {
	const cleaned = version.replace(/^v/, "").trim()
	const parts = cleaned.split(".").map((num) => parseInt(num, 10) || 0)
	return [parts[0] || 0, parts[1] || 0, parts[2] || 0]
}

function isVersionGte(version: string, targetVersion: string): boolean {
	const [aMajor, aMinor, aPatch] = parseSemver(version)
	const [bMajor, bMinor, bPatch] = parseSemver(targetVersion)

	if (aMajor !== bMajor) return aMajor > bMajor
	if (aMinor !== bMinor) return aMinor > bMinor
	return aPatch >= bPatch
}

/**
 * Creates a view-ignored target for ${targetName} (v1.x compatibility).
 */
export function ${functionName}V1(options: ${targetName}V1Options = {}): Target {
	const mode = options.mode || "publish"
	const version = options.version || "1.0.0"

	const extractors: Extractor[] = [
		{
			extract: extractIgnores,
			path: ".${targetName.toLowerCase()}ignore",
		},
	]

	const internalRules: Rule[] = [
		ruleCompile({
			compiled: null,
			excludes: true,
			list: isVersionGte(version, "1.0.0") ? [".git", "node_modules"] : [".git"],
		}),
	]

	return {
		extractors,
		ignores: ruleTest,
		internalRules,
		root: ".",
	}
}
`

	const indexTestTsContent = `import { describe, expect, test } from "bun:test"
import { scan } from "view-ignored"

import { ${functionName} } from "./index.js"

describe("${functionName}", () => {
	test("creates default target and scans directory", async () => {
		const target = ${functionName}()
		expect(target.root).toBe(".")
		expect(target.extractors.length).toBeGreaterThan(0)

		const ctx = await scan({ target })
		expect(ctx).toBeDefined()
	})
})
`

	const v0TestTsContent = `import { describe, expect, test } from "bun:test"
import { scan } from "view-ignored"

import { ${functionName}V0 } from "./v0.js"

describe("${functionName}V0", () => {
	test("creates v0 target and scans directory", async () => {
		const target = ${functionName}V0()
		expect(target.root).toBe(".")
		expect(target.extractors.length).toBeGreaterThan(0)

		const ctx = await scan({ target })
		expect(ctx).toBeDefined()
	})
})
`

	const v1TestTsContent = `import { describe, expect, test } from "bun:test"
import { scan } from "view-ignored"

import { ${functionName}V1 } from "./v1.js"

describe("${functionName}V1", () => {
	test("creates v1 target and scans directory", async () => {
		const target = ${functionName}V1()
		expect(target.root).toBe(".")
		expect(target.extractors.length).toBeGreaterThan(0)

		const ctx = await scan({ target })
		expect(ctx).toBeDefined()
	})
})
`

	const tsconfigJsonContent = JSON.stringify(
		{
			compilerOptions: {
				declaration: true,
				declarationMap: true,
				lib: ["es2024"],
				module: "nodenext",
				moduleResolution: "nodenext",
				noImplicitOverride: true,
				noImplicitReturns: true,
				noUncheckedIndexedAccess: true,
				outDir: "../out",
				rootDir: ".",
				skipLibCheck: true,
				sourceMap: true,
				strict: true,
				target: "esnext",
				types: ["node", "bun"],
				verbatimModuleSyntax: true,
			},
			exclude: ["../node_modules"],
		},
		null,
		"\t",
	)

	const tsconfigProdJsonContent = JSON.stringify(
		{
			compilerOptions: {
				declaration: true,
				declarationMap: false,
				sourceMap: false,
				types: ["node"],
			},
			exclude: ["**/*.test.*"],
			extends: "./tsconfig.json",
		},
		null,
		"\t",
	)

	const gitignoreContent = `out
node_modules
*.log
`

	const readmeContent = `# ${packageName}

view-ignored target plugin for ${targetName}.

## Installation

\`\`\`bash
bun add ${packageName} view-ignored
\`\`\`

## Usage

\`\`\`ts
import { scan } from "view-ignored"
import { ${functionName} } from "${packageName}" // Defaults to v1 target

const ctx = await scan({ target: ${functionName}() })
\`\`\`

### Major Version Exports

For explicit target version compatibility:

\`\`\`ts
// Explicit v0.x target compatibility
import { ${functionName}V0 } from "${packageName}/v0"

// Explicit v1.x target compatibility
import { ${functionName}V1 } from "${packageName}/v1"
\`\`\`

## License

MIT
`

	const files = [
		"package.json",
		"src/index.ts",
		"src/index.test.ts",
		"src/v0.ts",
		"src/v0.test.ts",
		"src/v1.ts",
		"src/v1.test.ts",
		"src/tsconfig.json",
		"src/tsconfig.prod.json",
		".gitignore",
		"README.md",
	]

	writeFileSync(resolve(outputDir, "package.json"), packageJsonContent, "utf8")
	writeFileSync(resolve(outputDir, "src/index.ts"), indexTsContent, "utf8")
	writeFileSync(resolve(outputDir, "src/index.test.ts"), indexTestTsContent, "utf8")
	writeFileSync(resolve(outputDir, "src/v0.ts"), v0TsContent, "utf8")
	writeFileSync(resolve(outputDir, "src/v0.test.ts"), v0TestTsContent, "utf8")
	writeFileSync(resolve(outputDir, "src/v1.ts"), v1TsContent, "utf8")
	writeFileSync(resolve(outputDir, "src/v1.test.ts"), v1TestTsContent, "utf8")
	writeFileSync(resolve(outputDir, "src/tsconfig.json"), tsconfigJsonContent, "utf8")
	writeFileSync(resolve(outputDir, "src/tsconfig.prod.json"), tsconfigProdJsonContent, "utf8")
	writeFileSync(resolve(outputDir, ".gitignore"), gitignoreContent, "utf8")
	writeFileSync(resolve(outputDir, "README.md"), readmeContent, "utf8")

	return {
		dir: outputDir,
		files,
		functionName,
		packageName,
	}
}

export function runCli(args: string[] = process.argv.slice(2)): void {
	if (args.includes("-h") || args.includes("--help")) {
		console.log(`
Usage: create-view-ignored [target-name] [directory] [options]

Options:
  -f, --force    Overwrite existing directory if non-empty
  -h, --help     Show this help message
`)
		return
	}

	let name: string | undefined
	let targetDir: string | undefined
	let force = false

	const positionalArgs: string[] = []
	for (const arg of args) {
		if (arg === "-f" || arg === "--force") {
			force = true
			continue
		}
		if (!arg.startsWith("-")) positionalArgs.push(arg)
	}

	const [argName, argTargetDir] = positionalArgs
	if (argName) name = argName
	if (argTargetDir) targetDir = argTargetDir

	try {
		const result = createTargetPackage({ force, name, targetDir })
		console.log(`Successfully created target package "${result.packageName}" in ${result.dir}`)
	} catch (error) {
		console.error("Error creating target package:", error instanceof Error ? error.message : error)
		process.exit(1)
	}
}

// Execute when invoked directly as CLI script
const currentFile = fileURLToPath(import.meta.url)
const executedFile = process.argv[1] ? resolve(process.argv[1]) : ""
if (
	executedFile &&
	(executedFile === currentFile ||
		basename(executedFile) === "create-view-ignored" ||
		basename(executedFile) === "create-target")
) {
	runCli()
}
