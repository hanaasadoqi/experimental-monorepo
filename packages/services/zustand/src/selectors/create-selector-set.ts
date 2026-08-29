import type { Selector } from "../types/index.js"

/**
 * Create a set of selectors for a store slice.
 * Useful for organizing selectors by domain.
 *
 * @example
 * ```typescript
 * const userSelectors = createSelectorSet({
 *   selectName: (state) => state.user.name,
 *   selectAge: (state) => state.user.age,
 *   selectAdult: (state) => state.user.age >= 18,
 * })
 * ```
 */
export const createSelectorSet = <
  T,
  K extends Record<string, Selector<T, unknown>>,
>(
  selectors: K
): Record<keyof K, Selector<T, unknown>> => {
  const result: Record<string, Selector<T, unknown>> = {}

  for (const [key, selector] of Object.entries(selectors)) {
    result[key] = selector
  }

  return result as Record<keyof K, Selector<T, unknown>>
}
