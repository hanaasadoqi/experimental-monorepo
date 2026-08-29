import type { PersistenceAdapter } from "./types"

/**
 * Create a localStorage persistence adapter.
 * @param key The localStorage key
 */
export const createLocalStorageAdapter = <T>(
  key: string
): PersistenceAdapter<T> => {
  return {
    read(): T | undefined {
      try {
        const item = localStorage.getItem(key)
        if (!item) return undefined
        return JSON.parse(item) as T
      } catch {
        return undefined
      }
    },

    write(state: T): void {
      try {
        localStorage.setItem(key, JSON.stringify(state))
      } catch {
        // Silently fail on quota exceeded or other write errors
      }
    },

    subscribe(listener: () => void): () => void {
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
