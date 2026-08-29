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
  key: string
): PersistenceAdapter<T> => {
  return {
    read(): T | undefined {
      if (!isBrowser() || !isLocalStorageAvailable()) {
        return undefined
      }

      try {
        const item = localStorage.getItem(key)
        if (!item) return undefined
        return JSON.parse(item) as T
      } catch {
        return undefined
      }
    },

    write(state: T): void {
      if (!isBrowser() || !isLocalStorageAvailable()) {
        return
      }

      try {
        localStorage.setItem(key, JSON.stringify(state))
      } catch {
        // Silently fail on quota exceeded or other write errors
      }
    },

    subscribe(listener: () => void): () => void {
      if (!isBrowser()) {
        // Return no-op unsubscribe in non-browser environments
        return () => {}
      }

      const handler = (e: StorageEvent) => {
        if (e.key === key) {
          listener()
        }
      }

      window.addEventListener("storage", handler)
      return () => window.removeEventListener("storage", handler)
    },
  }
}
