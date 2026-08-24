import type { Resource, InvalidSource } from "./resource.js"
import type { RuleMatch } from "./rule.js"

/**
 * Post-scan results.
 *
 * @since 0.6.0
 */
export interface MatcherContext {
	/**
	 * Paths and their corresponding sources.
	 * Directory paths end with a trailing slash.
	 *
	 * @since 0.6.0
	 */
	paths: Map<string, RuleMatch>

	/**
	 * Maps directory paths to their corresponding sources.
	 *
	 * @example
	 * "dir" => Source
	 * "dir/subdir" => Source
	 *
	 * @since 0.6.0
	 */
	external: Map<string, Resource>

	/**
	 * If any fatal errors were encountered during source extractions,
	 * this property will contain an array of failed sources.
	 *
	 * @since 0.6.0
	 */
	failed: InvalidSource[]

	/**
	 * Total number of matched files and directories per path.
	 *
	 * @since 0.11.0
	 */
	total: Map<string, Total>
}

export interface Total {
	/**
	 * Total number of files matched by the target.
	 *
	 * @since 0.6.0
	 */
	totalMatchedFiles: number

	/**
	 * Total number of directories matched by the target.
	 *
	 * @since 0.13.0
	 */
	totalMatchedDirs: number
}
