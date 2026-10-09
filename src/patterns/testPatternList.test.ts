import { describe, test, expect } from "bun:test"

import { makeNPM } from "../targets/npm.js"
import { type FsAdapter } from "../types.js"
import { MatcherStream } from "./matcherStream.js"
import { extractPackageJson, extractPackageJsonRules } from "./packagejson.js"
import { patternListCompile, PatternSpec } from "./patternList.js"
import { resolveSources } from "./resolveSources.js"
import { ruleTestSync, RuleMatchKind, type CustomRule, type GlobRule } from "./rule.js"
import { type Source } from "./source.js"
import { wildmatchCompile } from "./wildmatch.js"

function patternCacheTest(
	compiled: { re: { test(str: string): boolean } } | null,
	str: string,
): boolean {
	if (compiled === null) return false
	return compiled.re.test(str)
}

describe("patternListCompile", () => {
	test("compiles zeptomatch patterns by default", () => {
		expect(patternCacheTest(patternListCompile({ list: [".git"] }), ".git/message")).toBeTrue()
		expect(patternCacheTest(patternListCompile({ list: [".git"] }), ".Git/message")).toBeFalse()
		expect(
			patternCacheTest(patternListCompile({ list: [".git"], nocase: true }), ".Git/message"),
		).toBeTrue()
	})

	test("compiles with spec: PatternSpec.gitignore using wildmatch", () => {
		const compiled = patternListCompile({ list: ["foo*bar"], spec: PatternSpec.gitignore })
		expect(patternCacheTest(compiled, "foobazbar")).toBeTrue()
		expect(patternCacheTest(compiled, "foo/baz/bar")).toBeFalse()
	})

	test("case-insensitive compilation preserves ASCII range casing like [A-\\]", () => {
		const list = ["[A-\\\\]"]
		const compiled = patternListCompile({ list, nocase: true })
		expect(patternCacheTest(compiled, "G")).toBeTrue()
		expect(patternCacheTest(compiled, "g")).toBeTrue()
		expect(patternCacheTest(compiled, "A")).toBeTrue()
		expect(patternCacheTest(compiled, "a")).toBeTrue()
	})

	test("compiles extglob patterns correctly in patternListCompile and convertExtglobToRegex", () => {
		const ext1 = patternListCompile({ list: ["dist/*.?(m)js"], spec: PatternSpec.packageJsonFiles })
		expect(patternCacheTest(ext1, "dist/ua-parser.min.js")).toBeTrue()
		expect(patternCacheTest(ext1, "dist/ua-parser.min.mjs")).toBeTrue()

		const ext2 = patternListCompile({
			list: ["dist/cjs/**/!(*.tsbuildinfo)"],
			spec: PatternSpec.packageJsonFiles,
		})
		expect(patternCacheTest(ext2, "dist/cjs/index.js")).toBeTrue()
		expect(patternCacheTest(ext2, "dist/cjs/ajax/index.js")).toBeTrue()
		expect(patternCacheTest(ext2, "dist/cjs/foo.tsbuildinfo")).toBeFalse()
		expect(patternCacheTest(ext2, "dist/cjs/ajax/foo.tsbuildinfo")).toBeFalse()

		const ext3 = patternListCompile({
			list: ["src/@(foo|bar).ts"],
			spec: PatternSpec.packageJsonFiles,
		})
		expect(patternCacheTest(ext3, "src/foo.ts")).toBeTrue()
		expect(patternCacheTest(ext3, "src/bar.ts")).toBeTrue()
		expect(patternCacheTest(ext3, "src/baz.ts")).toBeFalse()

		const ext4 = patternListCompile({ list: ["*.*(c)[tj]s*"], spec: PatternSpec.packageJsonFiles })
		expect(patternCacheTest(ext4, "index.js")).toBeTrue()
		expect(patternCacheTest(ext4, "index.cjs")).toBeTrue()
		expect(patternCacheTest(ext4, "index.d.ts")).toBeTrue()
	})

	test("extractPackageJson error handling", () => {
		// oxlint-disable-next-line typescript/no-explicit-any
		const badSource = null as unknown as Source
		const err = extractPackageJson(badSource, Buffer.from("{}"))
		expect(err).toBeInstanceOf(Error)

		const source: Source = { dir: ".", inverted: false, path: "package.json", rules: [] }
		const err2 = extractPackageJson(source, Buffer.from("invalid json {"))
		expect(err2).toBeInstanceOf(Error)
	})

	test("extractPackageJsonRules records byte offset range", () => {
		const source: Source = { dir: ".", inverted: false, path: "package.json", rules: [] }
		const contentStr =
			'{\n  "name": "foo",\n  "version": "1.0.0",\n  "files": [\n    "dist"\n  ]\n}'
		extractPackageJsonRules(source, Buffer.from(contentStr))
		expect(source.rules).toHaveLength(1)
		const rule = source.rules[0] as GlobRule
		expect(rule.range).toBeDefined()
		expect(contentStr.slice(rule.range![0], rule.range![1])).toBe('"dist"')
	})

	test("wildmatchCompile empty list, invalid range, and regex fallback", () => {
		expect(() => wildmatchCompile({ list: [] })).toThrow(TypeError)

		const compiled = wildmatchCompile({ list: ["[z-a]"] })
		expect(compiled.re.test("a")).toBeFalse()
	})

	test("MatcherStream timeout, listeners and dispatch", () => {
		// oxlint-disable-next-line typescript/no-explicit-any
		const options: any = { cwd: ".", fs: {} as FsAdapter, noTimeout: true, target: makeNPM() }
		const stream = new MatcherStream(options)

		let listenerCalled = false
		const listener = () => {
			listenerCalled = true
		}

		// oxlint-disable-next-line typescript/no-explicit-any
		stream.addEventListener("end", listener as any)
		// oxlint-disable-next-line typescript/no-explicit-any
		stream.dispatchEvent(new CustomEvent("end", { detail: null }) as any)
		expect(listenerCalled).toBeTrue()

		listenerCalled = false
		// oxlint-disable-next-line typescript/no-explicit-any
		stream.removeEventListener("end", listener as any)
		// oxlint-disable-next-line typescript/no-explicit-any
		stream.dispatchEvent(new CustomEvent("end", { detail: null }) as any)
		expect(listenerCalled).toBeFalse()

		const timeoutStream = new MatcherStream({ cwd: ".", fs: {} as FsAdapter, target: makeNPM() })
		expect(() => {
			// oxlint-disable-next-line typescript/no-explicit-any
			clearTimeout((timeoutStream as any)["#timeout"])
		}).not.toThrow()
	})

	test("ruleTestSync CustomRule returning Error for internal and external rules", () => {
		const customErrorRule: CustomRule = {
			excludes: true,
			match: () => new Error("Custom match error"),
		}

		// oxlint-disable-next-line typescript/no-explicit-any
		const externalTarget: any = { internalRules: [] }

		const mockSource: Source = {
			dir: ".",
			inverted: false,
			path: ".gitignore",
			rules: [customErrorRule],
		}

		const matchExternal = ruleTestSync({
			cwd: ".",
			// oxlint-disable-next-line typescript/no-explicit-any
			dirent: { isDirectory: () => false, isFile: () => true, name: "foo.js" } as any,
			entry: "foo.js",
			// oxlint-disable-next-line typescript/no-explicit-any
			fs: {} as any,
			parentPath: ".",
			resource: mockSource,
			signal: null,
			target: externalTarget,
		})

		expect(matchExternal.kind).toBe(RuleMatchKind.invalidExternal)
		if (matchExternal.kind === RuleMatchKind.invalidExternal) {
			expect(matchExternal.error.message).toBe("Custom match error")
		}

		// oxlint-disable-next-line typescript/no-explicit-any
		const internalTarget: any = { internalRules: [customErrorRule] }

		const matchInternal = ruleTestSync({
			cwd: ".",
			// oxlint-disable-next-line typescript/no-explicit-any
			dirent: { isDirectory: () => false, isFile: () => true, name: "foo.js" } as any,
			entry: "foo.js",
			// oxlint-disable-next-line typescript/no-explicit-any
			fs: {} as any,
			parentPath: ".",
			resource: null,
			signal: null,
			target: internalTarget,
		})

		expect(matchInternal.kind).toBe(RuleMatchKind.invalidInternal)
		if (matchInternal.kind === RuleMatchKind.invalidInternal) {
			expect(matchInternal.error.message).toBe("Custom match error")
		}
	})

	test("ruleTestSync returns external kind when internal rule has range or source", () => {
		const mockSource: Source = { dir: ".", inverted: false, path: "package.json", rules: [] }

		const internalRangeRule: CustomRule = {
			excludes: false,
			match: () => "//custom range match",
			range: [0, 10],
			source: mockSource,
		}

		// oxlint-disable-next-line typescript/no-explicit-any
		const internalTarget: any = { internalRules: [internalRangeRule] }

		const match = ruleTestSync({
			cwd: ".",
			// oxlint-disable-next-line typescript/no-explicit-any
			dirent: { isDirectory: () => false, isFile: () => true, name: "index.js" } as any,
			entry: "index.js",
			// oxlint-disable-next-line typescript/no-explicit-any
			fs: {} as any,
			parentPath: ".",
			resource: mockSource,
			signal: null,
			target: internalTarget,
		})

		expect(match.kind).toBe(RuleMatchKind.external)
		if (match.kind === RuleMatchKind.external) {
			expect(match.source).toBe(mockSource)
			expect(match.rule).toBe(internalRangeRule)
		}
	})

	test("ruleTestSync cacheTest unexpected sub-pattern failure exception", () => {
		// oxlint-disable-next-line typescript/no-explicit-any
		const compiled: any = {
			compiledItems: [{ test: () => false }],
			list: ["patternA", "patternB"],
			re: /foo/,
		}

		const mockSource: Source = {
			dir: ".",
			inverted: false,
			path: ".gitignore",
			rules: [{ compiled, excludes: true, list: ["patternA", "patternB"] }],
		}

		expect(() =>
			ruleTestSync({
				cwd: ".",
				// oxlint-disable-next-line typescript/no-explicit-any
				dirent: { isDirectory: () => false, isFile: () => true, name: "foo" } as any,
				entry: "foo",
				// oxlint-disable-next-line typescript/no-explicit-any
				fs: {} as any,
				parentPath: ".",
				resource: mockSource,
				signal: null,
				// oxlint-disable-next-line typescript/no-explicit-any
				target: { internalRules: [] } as any,
			}),
		).toThrow("view-ignored has crashed: expected sub-pattern")
	})

	test("resolveSources findExtendedRoot edge cases and extractor errors", (done) => {
		let callCount = 0
		// oxlint-disable-next-line typescript/no-explicit-any
		const mockFs: any = {
			// oxlint-disable-next-line typescript/no-explicit-any
			readFile: (path: string, cb: any) => {
				callCount++
				if (path.includes("package.json")) {
					cb(null, Buffer.from("{ invalid json syntax"))
				} else if (path.includes(".gitignore")) {
					cb(null, Buffer.from("dummy content"))
				} else {
					const err = new Error("ENOENT")
					// oxlint-disable-next-line typescript/no-explicit-any
					;(err as any).code = "ENOENT"
					cb(err)
				}
			},
		}

		// oxlint-disable-next-line typescript/no-explicit-any
		const mockTarget: any = {
			extendsRoot: "workspaces_field_unique_key_1",
			extractors: [
				{
					extract: () => {
						throw new Error("Extractor exception")
					},
					path: ".gitignore",
				},
			],
			root: ".",
		}

		resolveSources(
			{
				cwd: "/dir_unique_a/dir_b",
				dir: ".",
				external: new Map(),
				fs: mockFs,
				signal: null,
				target: mockTarget,
			},
			(err, res) => {
				expect(err).toBeNull()
				expect(res).not.toBeNull()
				if (res && "error" in res) {
					expect(res.error.message).toBe("Extractor exception")
				}
				expect(callCount).toBeGreaterThan(0)
				done()
			},
		)
	})

	test("resolveSources findExtendedRoot reaching filesystem root", (done) => {
		// oxlint-disable-next-line typescript/no-explicit-any
		const mockFs: any = {
			// oxlint-disable-next-line typescript/no-explicit-any
			readFile: (_path: string, cb: any) => {
				const err = new Error("ENOENT")
				// oxlint-disable-next-line typescript/no-explicit-any
				;(err as any).code = "ENOENT"
				cb(err)
			},
		}

		// oxlint-disable-next-line typescript/no-explicit-any
		const mockTarget: any = {
			extendsRoot: "workspaces_field_unique_key_2",
			extractors: [],
			root: ".",
		}

		resolveSources(
			{
				cwd: "/dir_root_test",
				dir: ".",
				external: new Map(),
				fs: mockFs,
				signal: null,
				target: mockTarget,
			},
			(err, _res) => {
				expect(err).toBeNull()
				done()
			},
		)
	})

	test("resolveSources launchDirectoryExtractors error propagation", (done) => {
		// oxlint-disable-next-line typescript/no-explicit-any
		const mockFs: any = {
			// oxlint-disable-next-line typescript/no-explicit-any
			readFile: (_path: string, cb: any) => {
				const err = new Error("Fatal FS error")
				// oxlint-disable-next-line typescript/no-explicit-any
				;(err as any).code = "EIO"
				cb(err)
			},
		}

		// oxlint-disable-next-line typescript/no-explicit-any
		const mockTarget: any = { extractors: [{ extract: () => {}, path: ".gitignore" }], root: "." }

		resolveSources(
			{
				cwd: "/fs_error_dir",
				dir: ".",
				external: new Map(),
				fs: mockFs,
				signal: null,
				target: mockTarget,
			},
			(err, res) => {
				expect(err).toBeNull()
				expect(res).not.toBeNull()
				if (res && "error" in res) {
					expect(res.error.message).toBe("Fatal FS error")
				}
				done()
			},
		)
	})
})
