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
export const createMemoryAdapter = <T>(defaultKey: string): PersistenceAdapter<T> => {
  const store: Record<string, T | undefined> = {}

  return {
    read(key?: string): T | null {
      const k = key ?? defaultKey
      return (store[k] ?? null) as T | null
    },

    write(key: string | T, value?: T): void {
      // Support both old (value-only) and new (key, value) signatures for backwards compatibility
      if (typeof key === 'string') {
        store[key] = value
      } else {
        store[defaultKey] = key
      }
    },

    subscribe(_key: string, _listener: (value: T | null) => void): () => void {
      // In-memory adapter can't listen to external changes
      // Return no-op unsubscribe function
      return () => {}
    },
  }
}
