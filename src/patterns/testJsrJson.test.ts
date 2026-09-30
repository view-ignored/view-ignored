import type { GlobRule } from "./rule.js"
import type { Source } from "./source.js"

import { describe, test, expect } from "bun:test"

import { extractJsrJson, extractJsrJsonRules } from "./jsrjson.js"

describe("jsr.json", () => {
	test("does not parse 0", () => {
		const source: Source = {
			inverted: false,
			path: "jsr.json",
			rules: [],
		}
		// @ts-expect-error for 0
		expect(extractJsrJson(source, 0)).toBeInstanceOf(Error)
	})
	test("does not parse '{'", () => {
		const source: Source = {
			inverted: false,
			path: "jsr.json",
			rules: [],
		}
		expect(extractJsrJson(source, Buffer.from("{", "utf-8"))).toBeInstanceOf(Error)
	})
	test("parses '{}'", () => {
		const source: Source = {
			inverted: false,
			path: "jsr.json",
			rules: [],
		}
		expect(extractJsrJson(source, Buffer.from("{}", "utf-8"))).not.toBeInstanceOf(Error)
	})
	test("validates root is object and handles duplicate patterns", () => {
		const source: Source = {
			inverted: false,
			path: "jsr.json",
			rules: [],
		}
		expect(() => extractJsrJsonRules(source, Buffer.from("[1, 2, 3]"))).toThrow(
			"Root must be an object",
		)

		const jsrContent = JSON.stringify({
			exclude: ["*.tmp", "*.tmp"],
			include: ["src/**", "src/**"],
		})
		extractJsrJson(source, Buffer.from(jsrContent))
		expect(source.rules.length).toBe(2)
	})

	test("records byte offset range for extracted rules", () => {
		const source: Source = {
			inverted: false,
			path: "jsr.json",
			rules: [],
		}
		const content = '{\n  "exclude": ["*.tmp"],\n  "include": ["src/**"]\n}'
		const buf = Buffer.from(content)
		extractJsrJsonRules(source, buf)
		expect(source.rules).toHaveLength(2)

		const exRule = source.rules[0] as GlobRule
		const incRule = source.rules[1] as GlobRule
		expect(exRule.range).toBeDefined()
		expect(incRule.range).toBeDefined()
		expect(content.slice(exRule.range![0], exRule.range![1])).toBe('"*.tmp"')
		expect(content.slice(incRule.range![0], incRule.range![1])).toBe('"src/**"')
	})
})
