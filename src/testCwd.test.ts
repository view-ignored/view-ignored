import { makeGit } from "@view-ignored/target-git"
import { describe, test } from "bun:test"

import { testScan } from "./testScan.test.js"

describe("Git", () => {
	const tree = { ".git/HEAD": "", ".gitignore": "", file: "", folder: { nested: "" } }
	test("cwd works with ./test", async (done) => {
		await testScan(done, tree, ["file", ".gitignore", "folder/", "folder/nested"], {
			cwd: "./test",
			target: makeGit(),
			within: ".",
		})
	})
	test("cwd works with ./test/folder", async (done) => {
		await testScan(done, tree, ["folder/", "folder/nested"], {
			cwd: "./test",
			target: makeGit(),
			within: "./folder",
		})
	})
	test("cwd works with .\\test", async (done) => {
		await testScan(done, tree, ["file", ".gitignore", "folder/", "folder/nested"], {
			cwd: ".\\test",
			target: makeGit(),
			within: ".",
		})
	})
	test("cwd works with test", async (done) => {
		await testScan(done, tree, ["file", ".gitignore", "folder/", "folder/nested"], {
			cwd: "test",
			target: makeGit(),
			within: ".",
		})
	})
	test("absolute cwd works with process.cwd()/test", async (done) => {
		await testScan(done, tree, ["file", ".gitignore", "folder/", "folder/nested"], {
			cwd: process.cwd() + "/test",
			target: makeGit(),
			within: ".",
		})
	})
	test("absolute cwd works with process.cwd()/test/folder", async (done) => {
		await testScan(done, tree, ["folder/", "folder/nested"], {
			cwd: process.cwd() + "/test",
			target: makeGit(),
			within: "./folder",
		})
	})
})
