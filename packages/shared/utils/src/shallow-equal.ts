/**
 * Compare function for memoization.
 * Returns true if values are equal (no update needed).
 */
export type EqualityFn<T> = (a: T, b: T) => boolean

/**
 * Default shallow equality check for primitives.
 */
export const shallowEqual = <T extends Record<string, unknown>>(
  a: T,
  b: T
): boolean => {
  if (a === b) return true
  if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false

  const keysA: string[] = Object.keys(a)
  const keysB: string[] = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (a[key] !== b[key]) return false
  }

  return true
}
