import type { Selector } from "../types/index.js"
import { shallowEqual } from "@repo/shared-utils/shallow-equal"
import { createSelector } from "./create-selector.js"

/**
 * Create a shallow-equal memoized selector.
 * Useful for selecting objects that should be compared by value.
 */
export const createShallowSelector = <T, U extends Record<string, unknown>>(
  selector: Selector<T, U>
): Selector<T, U> => {
  return createSelector(selector, shallowEqual)
}
