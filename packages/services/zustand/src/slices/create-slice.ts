import type { SliceCreator } from "../types/index.js"
/**
 * Create a composable store slice.
 * Slices are individual pieces of store state that can be combined.
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string
 *   name: string
 * }
 *
 * interface AuthSlice {
 *   user: User | null
 *   setUser: (user: User | null) => void
 * }
 *
 * const createAuthSlice: SliceCreator<AppState, AuthSlice> = (set, get) => ({
 *   user: null,
 *   setUser: (user) => set({ user }),
 * })
 * ```
 */
export const createSlice = <T, U>(
  creator: SliceCreator<T, U>
): SliceCreator<T, U> => {
  return creator
}
