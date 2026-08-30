import type { PersistenceAdapter } from "../types/index.ts"

/**
 * In-memory persistence adapter.
 * Suitable for SSR environments where localStorage/cookies aren't available.
 * State is lost on page refresh.
 *
 * Can be used as:
 * - SSR fallback when storage APIs unavailable
 * - Testing with proper async interface compliance
 * - Temporary state that shouldn't persist
 */
export const createMemoryAdapter = <T>(defaultKey: string): PersistenceAdapter<T> => {
  const store: Record<string, T | undefined> = {}

  return {
    async read(key?: string): Promise<T | null> {
      const k = key ?? defaultKey
      return (store[k] ?? null) as T | null
    },

    async write(key: string, value: T): Promise<void> {
      store[key] = value
    },

    async delete(key: string): Promise<void> {
      delete store[key]
    },

    async clear(): Promise<void> {
      Object.keys(store).forEach(k => delete store[k])
    },

    subscribe(_key: string, _listener: (value: T | null) => void): () => void {
      // In-memory adapter can't listen to external changes
      // Return no-op unsubscribe function
      return () => {}
    },
  }
}
