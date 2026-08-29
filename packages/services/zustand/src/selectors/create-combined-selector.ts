import { type EqualityFn } from "@repo/shared-utils/shallow-equal"

/**
 * Create a selector that combines multiple input selectors.
 * Useful for selecting multiple values from state.
 *
 * @example
 * ```typescript
 * const selectUserAndTheme = createCombinedSelector(
 *   (state) => state.user,
 *   (state) => state.theme,
 *   (user, theme) => ({ user, theme })
 * )
 * ```
 */
export const createCombinedSelector = <T, U extends unknown[], R>(
  inputSelectors: [(state: T) => unknown, ...((state: T) => unknown)[]],
  resultSelector: (...inputs: U) => R,
  _equalityFn: EqualityFn<R> = (a, b) => a === b
) => {
  let lastInputs: unknown[] = []
  let lastResult: R | undefined

  return (state: T): R => {
    const nextInputs = inputSelectors.map((selector) => selector(state))

    // Check if any input changed
    const inputsChanged =
      lastInputs.length === 0 ||
      nextInputs.some((input, i) => input !== lastInputs[i])

    if (inputsChanged) {
      lastInputs = nextInputs
      lastResult = resultSelector(...(nextInputs as U))
    }

    return lastResult as R
  }
}
