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

- **Package Naming**: Defaults to `@view-ignored/target-<name>` or accepts custom package names.
- **Peer Dependency Freedom**: Configured with `"peerDependencies": { "view-ignored": "*" }` so plugin consumers are not forced to update or lock to specific `view-ignored` releases.
- **Version Subpath Exports**: Pre-configures major version subpaths (`.`, `./v0`, `./v1`) in `package.json` exports so authors can support multiple tool version architectures.
- **Options & Semver Comparison**: Accepts `{ mode?: string, version?: string }` options and includes a semver parser helper for version-specific rule branching.
- **Zero-Config Build Toolchain**: Includes TypeScript configurations (`tsconfig.json`, `tsconfig.prod.json`), oxlint, oxfmt, publint, and `bun test` integration out of the box.

### Example Plugin Structure

`src/v1.ts`:

```ts
import type { Target } from "view-ignored/targets"
import {
	extractIgnores,
	ruleCompile,
	ruleTest,
	type Extractor,
	type Rule,
} from "view-ignored/patterns"

export interface MyToolV1Options {
	/**
	 * Execution mode (e.g. "list" | "publish").
	 */
	mode?: string
	/**
	 * Tool version (e.g. "1.0.0").
	 */
	version?: string
}

export function makeMyToolV1(options: MyToolV1Options = {}): Target {
	const mode = options.mode || "publish"
	const version = options.version || "1.0.0"

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

### Subpath Export Imports

Consumers can import the default version or specific target versions:

```ts
import { scan } from "view-ignored"

// Default (v1 target)
import { makeMyTool } from "@view-ignored/target-mytool"

// Explicit v0.x target compatibility
import { makeMyToolV0 } from "@view-ignored/target-mytool/v0"

// Explicit v1.x target compatibility
import { makeMyToolV1 } from "@view-ignored/target-mytool/v1"
```

---

## Monorepo Internal Target Packages

To create a new built-in or workspace target plugin package inside the `view-ignored` monorepo, run:

```bash
bun run create <target-name>
```

This:

1. Creates a new package inside `packages/target-<name>`.
2. Automatically appends `target-<name>` as a release choice option in `.github/workflows/release.yml`.
3. Configures the repository's shared workspace scripts (`check`, `test`, `prod`, `lint`, `fmt`, `ts-compat`, `node-compat`, `publint`).
