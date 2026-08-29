import { SliceExtractor } from "../types/index.ts"

/**
 * Create a selector function for a specific slice.
 */
export const createSliceSelector = <T, K extends keyof T>(
  key: K
): SliceExtractor<T, K> => {
  return (state: T) => state[key]
}
