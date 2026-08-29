import type { PersistenceAdapter } from "../types/index.ts"

/**
 * In-memory persistence adapter.
 * Suitable for SSR environments where localStorage/cookies aren't available.
 * State is lost on page refresh.
 *
 * Can be used as:
 * - SSR fallback when storage APIs unavailable
 * - Testing mock
 * - Temporary state that shouldn't persist
 */
export const createMemoryAdapter = <T>(_key: string): PersistenceAdapter<T> => {
  let state: T | undefined

  return {
    read(): T | undefined {
      return state
    },

    write(newState: T): void {
      state = newState
    },

    subscribe(_listener: () => void): () => void {
      // In-memory adapter can't listen to external changes
      // Return no-op unsubscribe function
      return () => {}
    },
  }
}
