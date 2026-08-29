/**
 * Validate that a store has all required slices.
 * Useful for runtime checks in development.
 */
export const validateSlices = <T extends Record<string, unknown>>(
  state: T,
  requiredSlices: (keyof T)[]
): boolean => {
  return requiredSlices.every((slice) => slice in state)
}
