# How to Create Target Plugin Packages

This guide covers how to create custom `view-ignored` target plugins, both as public npm packages and as internal workspace target packages within the `view-ignored` monorepo.

## Public Target Plugin Packages

To scaffold a standalone target plugin package for publication on npm, use the `@view-ignored/create` CLI generator:

```bash
# Using bun
bun create @view-ignored/create <target-name>

# Using npm
npm create @view-ignored/create <target-name>
```

### Features of Generated Packages

- **Package Naming**: Automatically defaults to `@view-ignored/target-<name>` or accepts custom package names.
- **Peer Dependency Freedom**: Configured with `"peerDependencies": { "view-ignored": "*" }` so plugin consumers are not forced to update or lock to specific `view-ignored` releases.
- **Zero-Config Build Toolchain**: Includes TypeScript configurations (`tsconfig.json`, `tsconfig.prod.json`), oxlint, oxfmt, and `bun test` integration out of the box.

### Example Plugin Structure

```ts
import type { Target } from "view-ignored/targets"
import {
	extractIgnores,
	ruleCompile,
	ruleTest,
	type Extractor,
	type Rule,
} from "view-ignored/patterns"

export function makeMyTool(): Target {
	const extractors: Extractor[] = [
		{
			extract: extractIgnores,
			path: ".mytoolignore",
		},
	]

	const internalRules: Rule[] = [
		ruleCompile({
			compiled: null,
			excludes: true,
			list: [".git", "node_modules"],
		}),
	]

	return {
		extractors,
		ignores: ruleTest,
		internalRules,
		root: ".",
	}
}
```

---

## Monorepo Internal Target Packages

To create a new built-in or workspace target plugin package inside the `view-ignored` monorepo, run:

```bash
bun run create <target-name>
```

This creates a new package inside `packages/target-<name>` configured with the repository's shared workspace scripts (`check`, `test`, `prod`, `lint`, `fmt`, `ts-compat`, `node-compat`, `publint`).
