function isPlainObject(value: unknown): value is Record<string, any> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Recursively merge `patch` on top of `base`, returning a new object. Keys that exist in `base` but not in `patch`
 * are kept, so a settings file written by an older version of the overlay never leaves holes in the state.
 */
export function deepMerge<T>(base: T, patch: unknown): T {
	if (!isPlainObject(base) || !isPlainObject(patch)) {
		return (patch === undefined ? base : patch) as T;
	}
	const result: Record<string, any> = { ...base };
	for (const [key, value] of Object.entries(patch)) {
		result[key] = isPlainObject(result[key]) && isPlainObject(value)
			? deepMerge(result[key], value)
			: value;
	}
	return result as T;
}
