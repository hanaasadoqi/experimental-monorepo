import type { Selector } from "../types/index.js"
import { type EqualityFn } from "@repo/shared-utils/shallow-equal"

/**
 * Create a memoized selector that only triggers re-renders when the selected value changes.
 * Based on reselect pattern.
 *
 * @example
 * ```typescript
 * const selectUserName = createSelector(
 *   (state) => state.user,
 *   (user) => user.name
 * )
 *
 * // Usage
 * const name = selectUserName(store.getState())
 * ```
 */
export const createSelector = <T, U>(
  selector: Selector<T, U>,
  equalityFn: EqualityFn<U> = (a, b) => a === b
) => {
  let lastValue: U | undefined
  let lastResult: U | undefined

  return (state: T): U => {
    const nextValue = selector(state)

    if (lastValue === undefined || !equalityFn(nextValue, lastValue)) {
      lastValue = nextValue
      lastResult = nextValue
    }

    return lastResult as U
  }
}
