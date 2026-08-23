import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { argv, exit } from "node:process"

import { createTargetPackage } from "../packages/create/src/index.ts"

const args = argv.slice(2)

let name
let force = false

for (const arg of args) {
	if (arg === "-f" || arg === "--force") {
		force = true
	} else if (!arg.startsWith("-")) {
		name = arg
	}
}

if (!name || args.includes("-h") || args.includes("--help")) {
	console.log(`
Usage: bun run create <target-name> [options]

Creates a new view-ignored target plugin package inside the monorepo packages/ directory.

Options:
  -f, --force    Overwrite existing package directory
  -h, --help     Show this help message
`)
	exit(0)
}

const cleanedName = name
	.replace(/^@/, "")
	.replace(/^view-ignored-/, "")
	.replace(/^target-/, "")
	.toLowerCase()
const folderName = `target-${cleanedName}`
const packageName = `@view-ignored/target-${cleanedName}`
const targetDir = resolve("packages", folderName)

try {
	const result = createTargetPackage({
		force,
		name: packageName,
		targetDir,
	})

	const releaseWorkflowPath = resolve(".github/workflows/release.yml")
	if (existsSync(releaseWorkflowPath)) {
		let content = readFileSync(releaseWorkflowPath, "utf8")
		const optionLine = `          - ${folderName}`
		if (!content.includes(optionLine)) {
			content = content.replace(/(options:\s*\n\s*- root\s*\n\s*- create)/, `$1\n${optionLine}`)
			writeFileSync(releaseWorkflowPath, content, "utf8")
		}
	}

	console.log(
		`Successfully created monorepo target package "${result.packageName}" in ${result.dir}`,
	)
} catch (error) {
	console.error("Error creating target package:", error instanceof Error ? error.message : error)
	exit(1)
}
