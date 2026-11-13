<div align="center">
<h1>view-ignored</h1>

[![version](https://npmx.dev/api/registry/badge/version/view-ignored)](https://npmx.dev/package/view-ignored)
[![license](https://npmx.dev/api/registry/badge/license/view-ignored)](https://npmx.dev/package/view-ignored)
[![size](https://npmx.dev/api/registry/badge/size/view-ignored)](https://npmx.dev/package/view-ignored)
[![downloads](https://npmx.dev/api/registry/badge/downloads-week/view-ignored)](https://npmx.dev/package/view-ignored)
[![engine node 22 or later](https://npmx.dev/api/registry/badge/engines/view-ignored)](https://npmx.dev/package/view-ignored)
[![updated](https://npmx.dev/api/registry/badge/updated/view-ignored)](https://npmx.dev/package/view-ignored)<br/>
[![coverage](https://codecov.io/gh/view-ignored/view-ignored/graph/badge.svg?token=O5I06Y2A86)](https://codecov.io/gh/view-ignored/view-ignored)
![typescript v5.7 or later](https://img.shields.io/badge/ts->%3D5.7-salad?repo=view-ignored/view-ignored)
[![speed-fast](https://img.shields.io/badge/speed-fast-salad?repo=view-ignored/view-ignored.svg)](https://github.com/view-ignored/view-ignored/tree/main/benchmarks)

Retrieve a list of files ignored or included by Git, NPM, Yarn, JSR, Deno, Bun, VS Code extension CLI, and other tools.

</div>

## Highlights

- **Reader.** Get included files by parsing configurations directly, without wrapping CLI tools.
- **Reasoning.** Detailed tracing of why specific files are included or excluded with rule-origin paths.
- **Fast & Streaming.** Highly optimized performance with native `scanStream` support for massive file trees.
- **Execution Control.** Fine-tune traversal with `within`, `depth`, `skipDepth`, and standard `AbortSignal`.
- **Browser & Windows.** Fully compatible with browser environments, custom filesystem adapters (`memfs`), and Windows paths.
- **Plugins.** Modular targets for popular tools + custom target support via the `Target` interface.

## Quick Start

```sh
bun add view-ignored @view-ignored/target-git
```

```ts
import * as vign from "view-ignored"
import { makeGit } from "@view-ignored/target-git"

const ctx = await vign.scan({ target: makeGit() })
console.log(ctx.paths.has("src/index.ts")) // true
```

## Documentation & Wiki

All guides, target specifications, scan options, and examples are maintained in our Wiki:

- **[Wiki Home](https://github.com/view-ignored/view-ignored/wiki)**
- **Supported Targets**: [Git](https://github.com/view-ignored/view-ignored/wiki/Target-Git), [NPM](https://github.com/view-ignored/view-ignored/wiki/Target-NPM), [Bun](https://github.com/view-ignored/view-ignored/wiki/Target-Bun), [Yarn](https://github.com/view-ignored/view-ignored/wiki/Target-Yarn), [Yarn Classic](https://github.com/view-ignored/view-ignored/wiki/Target-Yarn-Classic), [VSCE](https://github.com/view-ignored/view-ignored/wiki/Target-VSCE), [JSR](https://github.com/view-ignored/view-ignored/wiki/Target-JSR), [Deno](https://github.com/view-ignored/view-ignored/wiki/Target-Deno) ([Custom](https://github.com/view-ignored/view-ignored/wiki/Target-Custom), [Issues](https://github.com/view-ignored/view-ignored/issues?q=is%3Aissue%20state%3Aopen%20label%3Atargets), [Suggest](https://github.com/view-ignored/view-ignored/issues/new))
- **Scan Options**: [`target`](https://github.com/view-ignored/view-ignored/wiki/Option-target), [`cwd`](https://github.com/view-ignored/view-ignored/wiki/Option-cwd), [`within`](https://github.com/view-ignored/view-ignored/wiki/Option-within), [`invert`](https://github.com/view-ignored/view-ignored/wiki/Option-invert), [`depth`](https://github.com/view-ignored/view-ignored/wiki/Option-depth), [`signal`](https://github.com/view-ignored/view-ignored/wiki/Option-signal), [`skipDepth`](https://github.com/view-ignored/view-ignored/wiki/Option-skipDepth), [`dirs`](https://github.com/view-ignored/view-ignored/wiki/Option-dirs), [`fs`](https://github.com/view-ignored/view-ignored/wiki/Option-fs)
- **Guides**: [Pack NPM Tarball](https://github.com/view-ignored/view-ignored/wiki/How-to-pack-npm-tar), [Streaming](https://github.com/view-ignored/view-ignored/wiki/How-to-use-stream), [Incremental Updates](https://github.com/view-ignored/view-ignored/wiki/How-to-use-incremental), [File Watching](https://github.com/view-ignored/view-ignored/wiki/How-to-watch-files), [Target Plugin Packages](https://github.com/view-ignored/view-ignored/wiki/How-to-create-plugin-public-npm-package), [Contributing Guide](https://github.com/view-ignored/view-ignored/wiki/How-to-contribute)

## License

MIT License. See [LICENSE.txt](LICENSE.txt) for details.
