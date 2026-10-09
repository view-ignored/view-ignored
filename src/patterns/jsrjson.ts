import type { ExtractorFn } from "./extractor.js"
import type { GlobRule } from "./rule.js"

import stripJsonComments from "strip-json-comments"

import { compileSourceRules, tryExtract } from "./extractorUtils.js"
import { scanJsonRuleRanges, resolveNegatable, type Source } from "./source.js"

const decoder = new TextDecoder()

interface JsrManifest {
	exclude?: string[]
	include?: string[]
	publish?: { exclude?: string[]; include?: string[] }
}

/**
 * Extracts and compiles patterns from the file.
 *
 * @since 0.6.0
 */
export function extractJsrJson(source: Source, content: Uint8Array): void | Error {
	return tryExtract(() => extractJsrJsonRules(source, content))
}

extractJsrJson satisfies ExtractorFn

/**
 * Extracts and compiles patterns from the file.
 *
 * @since 0.12.0
 */
export function extractJsrJsonRules(source: Source, content: Uint8Array): void {
	let dist: JsrManifest

	try {
		dist = JSON.parse(stripJsonComments(decoder.decode(content)))
	} catch (e) {
		throw new Error("Invalid JSON in '" + source.path + "'", { cause: e })
	}

	if (!dist || typeof dist !== "object" || Array.isArray(dist))
		throw new Error("Invalid '" + source.path + "': Root must be an object")

	let rule: GlobRule | undefined
	const target = dist.publish ?? dist

	const processList = (list: string[] | undefined, key: string, invert: boolean) => {
		if (!Array.isArray(list)) return
		const ranges = scanJsonRuleRanges(content, key)
		for (let i = 0; i < list.length; i++) {
			const range = ranges[i]
			const nextRule = resolveNegatable(list[i]!, invert, rule, range?.[0], range?.[1])
			if (nextRule !== rule) {
				rule = nextRule
				source.rules.push(rule)
			}
		}
	}

	processList(target.exclude, dist.publish ? "publish.exclude" : "exclude", false)
	processList(target.include, dist.publish ? "publish.include" : "include", true)

	compileSourceRules(source, { nocase: true })
}
