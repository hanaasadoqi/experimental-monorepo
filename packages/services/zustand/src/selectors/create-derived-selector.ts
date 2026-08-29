import type { Selector } from "../types/index.js"
import { type EqualityFn } from "@repo/shared-utils/shallow-equal"

/**
 * Create a selector that derives from one or more input selectors.
 * Similar to reselect's createSelector with dependency tracking.
 *
 * @example
 * ```typescript
 * const selectUserAge = createDerivedSelector(
 *   (state) => state.user,
 *   (user) => user.age
 * )
 *
 * const selectAdultUsers = createDerivedSelector(
 *   (state) => state.users,
 *   (users) => users.filter(u => u.age >= 18)
 * )
 * ```
 */
export const createDerivedSelector = <T, U>(
  inputSelector: Selector<T, unknown>,
  resultSelector: (input: unknown) => U,
  equalityFn: EqualityFn<U> = (a, b) => a === b
) => {
  let lastInput: unknown
  let lastResult: U | undefined

  return (state: T): U => {
    const input = inputSelector(state)

    if (lastInput === undefined || input !== lastInput) {
      lastInput = input
      lastResult = resultSelector(input)
    } else if (
      lastResult !== undefined &&
      !equalityFn(lastResult, lastResult)
    ) {
      lastResult = resultSelector(input)
    }

    return lastResult as U
  }
}
