import type { PersistenceAdapter } from "../types/index.js"
import { isBrowser } from "../utils/ssr.js"

function parseStoredValue<T>(value: string | null): T | null {
  if (value === null) return null

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

/**
 * Creates an SSR-safe localStorage adapter scoped to a default key.
 *
 * Reads treat unavailable or malformed data as absent. Mutations surface
 * browser storage errors so persistence middleware can report them.
 */
export const createLocalStorageAdapter = <T>(
  defaultKey: string
): PersistenceAdapter<T> => ({
  async read(key?: string): Promise<T | null> {
    if (!isBrowser()) return null

    try {
      return parseStoredValue<T>(window.localStorage.getItem(key ?? defaultKey))
    } catch {
      return null
    }
  },

  async write(key: string, state: T): Promise<void> {
    if (!isBrowser()) return
    window.localStorage.setItem(key, JSON.stringify(state))
  },

  async delete(key: string): Promise<void> {
    if (!isBrowser()) return
    window.localStorage.removeItem(key)
  },

  async clear(): Promise<void> {
    if (!isBrowser()) return
    window.localStorage.removeItem(defaultKey)
  },

  subscribe(key: string, listener: (value: T | null) => void): () => void {
    if (!isBrowser()) return () => undefined

    const handler = (event: StorageEvent): void => {
      if (event.key !== key) return
      listener(parseStoredValue<T>(event.newValue))
    }

    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  },
})
