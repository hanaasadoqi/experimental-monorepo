import type { PersistenceAdapter } from "../types/index.ts"
import { isBrowser, isLocalStorageAvailable } from "../utils/ssr.ts"

/**
 * Create a localStorage persistence adapter.
 * Safe for SSR - returns undefined on read if localStorage unavailable.
 *
 * @param key The localStorage key
 * @throws Nothing - fails gracefully in SSR/non-browser environments
 */
export const createLocalStorageAdapter = <T>(
  defaultKey: string
): PersistenceAdapter<T> => {
  return {
    async read(key?: string): Promise<T | null> {
      const storageKey = key ?? defaultKey
      if (!isBrowser() || !isLocalStorageAvailable()) {
        return null
      }

      try {
        const item = localStorage.getItem(storageKey)
        if (!item) return null
        return JSON.parse(item) as T
      } catch {
        return null
      }
    },

    async write(key: string, state: T): Promise<void> {
      if (!isBrowser() || !isLocalStorageAvailable()) {
        return
      }

      try {
        localStorage.setItem(key, JSON.stringify(state))
      } catch {
        // Silently fail on quota exceeded or other write errors
      }
    },

    async delete(key: string): Promise<void> {
      if (!isBrowser() || !isLocalStorageAvailable()) {
        return
      }

      try {
        localStorage.removeItem(key)
      } catch {
        // Silently fail on delete errors
      }
    },

    async clear(): Promise<void> {
      if (!isBrowser() || !isLocalStorageAvailable()) {
        return
      }

      try {
        localStorage.clear()
      } catch {
        // Silently fail on clear errors
      }
    },

    subscribe(key: string, listener: (value: T | null) => void): () => void {
      const storageKey = key ?? defaultKey
      if (!isBrowser()) {
        // Return no-op unsubscribe in non-browser environments
        return () => {}
      }

      const handler = (e: StorageEvent) => {
        if (e.key === storageKey) {
          listener(null)
        }
      }

      window.addEventListener("storage", handler)
      return () => window.removeEventListener("storage", handler)
    },
  }
}
