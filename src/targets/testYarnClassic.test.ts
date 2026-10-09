import { describe, test, expect } from "bun:test"

import { testScan } from "../testScan.test.js"
import { makeYarnClassic } from "./yarnClassic.js"

const packageJson = JSON.stringify({ name: "yarn-classic-test", version: "1.0.0" })

describe("Yarn Classic", () => {
	test("includes package.json", async (done) => {
		await testScan(
			done,
			{ "index.js": "", "package.json": packageJson },
			["package.json", "index.js"],
			{ target: makeYarnClassic() },
		)
	})

	test("ignores node_modules", async (done) => {
		await testScan(
			done,
			{ node_modules: { a: "" }, "package.json": packageJson },
			["package.json"],
			{ target: makeYarnClassic() },
		)
	})

	test("excludes .gitignore and .npmignore after evaluating nested rules", async (done) => {
		await testScan(
			done,
			{ sub: { ".gitignore": "*\n!file.txt", "file.txt": "hello" }, "package.json": packageJson },
			["package.json", "sub/file.txt"],
			{ dirs: false, target: makeYarnClassic() },
		)
	})

	test("excludes .npm-extension files", async (done) => {
		await testScan(
			done,
			{
				".npm-extension.cjs": "module.exports = {}\n",
				".npm-extension.mjs": "export {}\n",
				lib: { "index.js": "" },
				"package.json": JSON.stringify({
					files: [".npm-extension.cjs", ".npm-extension.mjs", "lib"],
					name: "yarn-classic-test",
					version: "1.0.0",
				}),
			},
			["lib/index.js", "package.json"],
			{ dirs: false, target: makeYarnClassic() },
		)
	})

	test("ignores nested .yarnignore as pattern extractor while keeping root .yarnignore", async (done) => {
		await testScan(
			done,
			{ "package.json": packageJson, sub: { ".yarnignore": "file.txt", "file.txt": "hello" } },
			["package.json", "sub/.yarnignore", "sub/file.txt"],
			{ dirs: false, target: makeYarnClassic() },
		)
	})

	test("throws an error if package.json is invalid", async (done) => {
		expect(() =>
			testScan(done, { "package.json": "{ invalid json }" }, () => {}, {
				target: makeYarnClassic(),
			}),
		).toThrow()
		expect(() =>
			testScan(done, { "package.json": "{}" }, () => {}, { target: makeYarnClassic() }),
		).toThrow()
		expect(() =>
			testScan(done, { "package.json": '{ "name": 0, "version": 0 }' }, () => {}, {
				target: makeYarnClassic(),
			}),
		).toThrow()
	})

	test("excludes yarn.lock by default even if in files array", async (done) => {
		await testScan(
			done,
			{
				"README.md": "",
				"index.js": "",
				"package.json": JSON.stringify({
					files: ["index.js", "yarn.lock"],
					name: "yarn-classic-test",
					version: "1.0.0",
				}),
				"yarn.lock": "lock content",
			},
			["README.md", "index.js", "package.json"],
			{ dirs: false, target: makeYarnClassic() },
		)
	})

	test("unconditionally packs README files in subdirectories", async (done) => {
		await testScan(
			done,
			{
				"package.json": JSON.stringify({
					files: ["dist"],
					name: "yarn-classic-test",
					version: "1.0.0",
				}),
				dist: { "README.md": "nested readme", "index.js": "code" },
			},
			["dist/README.md", "dist/index.js", "package.json"],
			{ dirs: false, target: makeYarnClassic() },
		)
	})

	test("force-includes main and exports.types when files array is specified", async (done) => {
		await testScan(
			done,
			{
				"bin.mjs": "cli",
				"browser.d.ts": "types",
				"index.js": "main entry",
				lib: { "util.js": "lib code" },
				"package.json": JSON.stringify({
					bin: "bin.mjs",
					exports: { "./browser": { import: "./browser.mjs", types: "./browser.d.ts" } },
					files: ["lib"],
					main: "index.js",
					name: "yarn-classic-test",
					version: "1.0.0",
				}),
			},
			["browser.d.ts", "index.js", "lib/util.js", "package.json"],
			{ dirs: false, target: makeYarnClassic() },
		)
	})
})
