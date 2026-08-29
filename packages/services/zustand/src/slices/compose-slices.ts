import type { StateCreator, SliceCreator } from "../types/index.js"

/**
 * Compose multiple slices into a single store creator.
 *
 * @example
 * ```typescript
 * const useStore = create(
 *   composeSlices<AppState>(
 *     createAuthSlice,
 *     createThemeSlice,
 *     createUISlice,
 *   )
 * )
 * ```
 */
export const composeSlices = <T>(
  ...sliceCreators: SliceCreator<T, unknown>[]
) => {
  return ((set, get, api) => {
    let state: Record<string, unknown> = {}

    // Execute each slice creator and merge results
    for (const creator of sliceCreators) {
      const sliceState = creator(set, get, api) as Partial<T>
      state = { ...state, ...sliceState }
    }

    return state
  }) as StateCreator<T, []>
}
