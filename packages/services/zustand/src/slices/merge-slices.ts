/**
 * Helper to merge multiple partial slices into final state.
 */
export const mergeSlices = <T extends Record<string, unknown>>(
  ...slices: Partial<T>[]
): Partial<T> => {
  return slices.reduce((acc, slice) => ({ ...acc, ...slice }), {} as Partial<T>)
}
