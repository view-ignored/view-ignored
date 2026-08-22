import { resolve } from "node:path"
import { argv, exit } from "node:process"

import { createTargetPackage } from "../packages/create/src/index.ts"

const args = argv.slice(2)

if (args.includes("-h") || args.includes("--help")) {
	console.log(`
Usage: bun run create <target-name> [options]

Creates a new view-ignored target plugin package inside the monorepo packages/ directory.

Options:
  -f, --force    Overwrite existing package directory
  -h, --help     Show this help message
`)
	exit(0)
}

let name = "custom"
let force = false

for (const arg of args) {
	if (arg === "-f" || arg === "--force") {
		force = true
	} else if (!arg.startsWith("-")) {
		name = arg
	}
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
	console.log(
		`Successfully created monorepo target package "${result.packageName}" in ${result.dir}`,
	)
} catch (error) {
	console.error("Error creating target package:", error instanceof Error ? error.message : error)
	exit(1)
}
