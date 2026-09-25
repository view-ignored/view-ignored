import { test, describe, expect } from "bun:test"

import { testScan } from "../testScan.test.js"
import { makeGit } from "./git.js"

function createGitIndexBuffer(paths: string[]): Uint8Array {
	let totalLen = 12
	for (const p of paths) {
		const entryLen = 62 + Buffer.byteLength(p) + 1
		const pad = (8 - (entryLen % 8)) % 8
		totalLen += entryLen + pad
	}
	const buf = Buffer.alloc(totalLen)
	buf.write("DIRC", 0, 4, "utf8")
	buf.writeUInt32BE(2, 4)
	buf.writeUInt32BE(paths.length, 8)

	let pos = 12
	for (const p of paths) {
		const start = pos
		const pLen = Buffer.byteLength(p)
		const flags = pLen < 0xfff ? pLen : 0xfff
		buf.writeUInt16BE(flags, pos + 60)
		pos += 62
		buf.write(p, pos, "utf8")
		pos += pLen
		buf[pos++] = 0
		const entryLen = pos - start
		const pad = (8 - (entryLen % 8)) % 8
		pos += pad
	}
	return buf
}

describe("Git", () => {
	test("empty for empty", async (done) => {
		await testScan(done, { ".": null }, [], { target: makeGit() })
	})

	test("includes for no sources", async (done) => {
		await testScan(done, { file: "" }, ["file"], { target: makeGit() })
	})

	test("keeps for empty source", async (done) => {
		await testScan(
			done,
			{
				".gitignore": "",
				file: "",
			},
			["file", ".gitignore"],
			{ target: makeGit() },
		)
	})

	test("ignores .git/", async (done) => {
		await testScan(
			done,
			{
				".git/HEAD": "",
				".gitignore": "",
				file: "",
			},
			["file", ".gitignore"],
			{ target: makeGit() },
		)
	})

	test("ignores filei (.git/info/exclude)", async (done) => {
		await testScan(
			done,
			{
				".git/info/exclude": "filei",
				file: "",
				filei: "",
			},
			["file"],
			{ target: makeGit() },
		)
	})

	test("ignores filei", async (done) => {
		await testScan(
			done,
			{
				".gitignore": "filei",
				filei: "",
			},
			[".gitignore"],
			{ target: makeGit() },
		)
	})

	test("includes file (case File no match)", async (done) => {
		await testScan(
			done,
			{
				".gitignore": "File",
				file: "",
			},
			[".gitignore", "file"],
			{ target: makeGit() },
		)
	})

	test("ignores multiple files", async (done) => {
		await testScan(
			done,
			{
				".gitignore": "file1.txt\nfile2.txt",
				"file1.txt": "",
				"file2.txt": "",
			},
			[".gitignore"],
			{ target: makeGit() },
		)
	})

	test("ignores files with pattern", async (done) => {
		await testScan(
			done,
			{
				".gitignore": "*.js",
				"bar.js": "",
				"foo.js": "",
			},
			[".gitignore"],
			{ target: makeGit() },
		)
	})

	test("ignores files in subdirectory", async (done) => {
		await testScan(
			done,
			{
				".gitignore": "src/",
				out: {
					"helper.js": "",
					"main.js": "",
				},
				src: {
					"helper.js": "",
					"main.js": "",
				},
			},
			[".gitignore", "out/", "out/main.js", "out/helper.js"],
			{ target: makeGit() },
		)
	})

	test("does not ignore files not matching pattern", async (done) => {
		await testScan(
			done,
			{
				".gitignore": "*.js",
				"bar.js": "",
				"foo.txt": "",
			},
			["foo.txt", ".gitignore"],
			{ target: makeGit() },
		)
	})

	test("negation pattern keeps file", async (done) => {
		await testScan(
			done,
			{
				".gitignore": "*.js\n!negkeep.js",
				"foo.js": "",
				"negkeep.js": "",
			},
			["negkeep.js", ".gitignore"],
			{ target: makeGit() },
		)
	})

	test("exclude works together with .gitignore", async (done) => {
		await testScan(
			done,
			{
				".git/info/exclude": "file_gitinfoex",
				".gitignore": "file_gitignore",
				file_gitignore: "",
				file_gitinfoex: "",
				file_keep: "",
			},
			[".gitignore", "file_keep"],
			{ target: makeGit() },
		)
	})

	test("gitignore has higher priority than exclude", async (done) => {
		await testScan(
			done,
			{
				".git/info/exclude": "file\n!file",
				".gitignore": "file",
				file: "",
			},
			[".gitignore"],
			{ target: makeGit() },
		)
	})

	test("respects .git/info/exclude when scanning with within", async () => {
		await new Promise<void>((done) =>
			testScan(
				done,
				{
					".git": {
						info: {
							exclude: "ignored_file",
						},
					},
					subdir: {
						ignored_file: "",
						kept_file: "",
					},
				},
				["subdir/", "subdir/kept_file"],
				{ target: makeGit(), within: "subdir" },
			),
		)
	})

	test("respects .git/info/exclude when scanning with within (.)", async () => {
		await new Promise<void>((done) =>
			testScan(
				done,
				{
					".git": {
						info: {
							exclude: "ignored_file",
						},
					},
					ignored_file: "",
					kept_file: "",
				},
				["kept_file"],
				{ target: makeGit(), within: "." },
			),
		)
	})

	test("respects .git/info/exclude when scanning with within (./)", async () => {
		await new Promise<void>((done) =>
			testScan(
				done,
				{
					".git": {
						info: {
							exclude: "ignored_file",
						},
					},
					ignored_file: "",
					kept_file: "",
				},
				["kept_file"],
				{ target: makeGit(), within: "./" },
			),
		)
	})

	test("respects .git/info/exclude when scanning with within (./subdir)", async () => {
		await new Promise<void>((done) =>
			testScan(
				done,
				{
					".git": {
						info: {
							exclude: "ignored_file",
						},
					},
					subdir: {
						ignored_file: "",
						kept_file: "",
					},
				},
				["subdir/", "subdir/kept_file"],
				{ target: makeGit(), within: "./subdir" },
			),
		)
	})

	test("respects .git/info/exclude when scanning with within (subdir/)", async () => {
		await new Promise<void>((done) =>
			testScan(
				done,
				{
					".git": {
						info: {
							exclude: "ignored_file",
						},
					},
					subdir: {
						ignored_file: "",
						kept_file: "",
					},
				},
				["subdir/", "subdir/kept_file"],
				{ target: makeGit(), within: "subdir/" },
			),
		)
	})

	test("respects .git/info/exclude when scanning with within (nested)", async () => {
		await new Promise<void>((done) =>
			testScan(
				done,
				{
					".git": {
						info: {
							exclude: "ignored_file",
						},
					},
					subdir: {
						subsubdir: {
							ignored_file: "",
							kept_file: "",
						},
					},
				},
				["subdir/subsubdir/", "subdir/subsubdir/kept_file"],
				{ target: makeGit(), within: "subdir/subsubdir" },
			),
		)
	})

	test("respects .git/info/exclude when scanning with within (nested, with depth)", async () => {
		await new Promise<void>((done) =>
			testScan(
				done,
				{
					".git": {
						info: {
							exclude: "ignored_file",
						},
					},
					subdir: {
						subsubdir: {
							ignored_file: "",
							kept_file: "",
						},
					},
				},
				["subdir/subsubdir/", "subdir/subsubdir/kept_file"],
				{ depth: 2, target: makeGit(), within: "subdir/subsubdir" },
			),
		)
	})

	test("within depth 0", async (done) => {
		await testScan(
			done,
			{
				subdir: {
					file: "",
				},
			},
			["subdir/", "subdir/file"],
			{ depth: 0, target: makeGit(), within: "subdir" },
		)
	})

	test("within nested depth 1", async (done) => {
		await testScan(
			done,
			{
				a: {
					b: {
						file: "",
					},
				},
			},
			["a/b/", "a/b/file"],
			{ depth: 1, target: makeGit(), within: "a/b" },
		)
	})

	test("ignores file (case File match) with ignorecase = true", async (done) => {
		await testScan(
			done,
			{
				".git": {
					config: "[core]\n\tignorecase = true",
				},
				".gitignore": "File",
				file: "",
			},
			[".gitignore"],
			{ target: makeGit() },
		)
	})

	test("does not ignore file (case File no match) with ignorecase = false", async (done) => {
		await testScan(
			done,
			{
				".git": {
					config: "[core]\n\tignorecase = false",
				},
				".gitignore": "File",
				file: "",
			},
			[".gitignore", "file"],
			{ target: makeGit() },
		)
	})

	test("respects both global excludesfile and .git/info/exclude", async (done) => {
		await testScan(
			done,
			{
				".git": {
					config: "[core]\n\texcludesfile = global_ignore",
					info: {
						exclude: "exclude_file",
					},
				},
				global_ignore: "global_file",
				global_file: "",
				exclude_file: "",
				keep_file: "",
			},
			["global_ignore", "keep_file"],
			{ target: makeGit() },
		)
	})

	test("git info exclude has higher priority than global excludesfile", async (done) => {
		await testScan(
			done,
			{
				".git": {
					config: "[core]\n\texcludesfile = global_ignore",
					info: {
						exclude: "!file_both",
					},
				},
				global_ignore: "file_both",
				file_both: "",
			},
			["file_both", "global_ignore"],
			{ target: makeGit() },
		)
	})

	test("unignores tracked files from .git/index and reports reasoning", async (done) => {
		const indexBuf = createGitIndexBuffer(["src/tracked.ts", "package.json"])
		await testScan(
			done,
			{
				".git": {
					index: indexBuf,
				},
				".gitignore": "src/\n*.log",
				"package.json": "{}",
				src: {
					"tracked.ts": "console.log(1)",
					"untracked.log": "log",
				},
			},
			({ ctx }) => {
				expect(ctx.paths.has("src/tracked.ts")).toBe(true)
				expect(ctx.paths.has("src/untracked.log")).toBe(false)
				const trackedMatch = ctx.paths.get("src/tracked.ts")
				expect(trackedMatch?.ignored).toBe(false)
				expect(trackedMatch && "pattern" in trackedMatch ? trackedMatch.pattern : undefined).toBe(
					"//tracked by git",
				)
			},
			{ target: makeGit() },
		)
	})
})
