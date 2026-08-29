import type { AppearancePreference } from "../types"
import { APPEARANCE_PREFERENCES } from "./types"
import type { AppearancePersistenceAdapter } from "./types"

const STORAGE_KEY = "appearance-preference"

function isAppearancePreference(value: unknown): value is AppearancePreference {
  return (
    typeof value === "string" &&
    (APPEARANCE_PREFERENCES as readonly string[]).includes(value)
  )
}

function getLocalStorage(): Storage | null {
  try {
    if (typeof localStorage === "undefined") {
      return null
    }
    return localStorage
  } catch {
    // Accessing `localStorage` can throw in some private-browsing modes.
    return null
  }
}

/**
 * Persists the appearance preference to `localStorage` under the
 * `appearance-preference` key. Cross-tab synchronization relies on the
 * browser's native `storage` event, which fires in other same-origin tabs
 * (never in the tab that made the write).
 *
 * Safe to call in non-browser environments (SSR): all reads/writes/
 * subscriptions become no-ops when `localStorage` or `window` is
 * unavailable.
 */
export function createLocalStorageAppearanceAdapter(): AppearancePersistenceAdapter {
  return {
    read(): AppearancePreference | null {
      const storage = getLocalStorage()
      if (!storage) {
        return null
      }

      let raw: string | null
      try {
        raw = storage.getItem(STORAGE_KEY)
      } catch {
        return null
      }

      return isAppearancePreference(raw) ? raw : null
    },

    write(preference: AppearancePreference): void {
      const storage = getLocalStorage()
      if (!storage) {
        return
      }

      try {
        storage.setItem(STORAGE_KEY, preference)
      } catch {
        // Storage may be full or disabled (e.g. private browsing); fail
        // silently and keep in-memory state valid.
      }
    },

    subscribe(
      listener: (preference: AppearancePreference) => void
    ): () => void {
      if (
        typeof window === "undefined" ||
        typeof window.addEventListener !== "function"
      ) {
        return () => {}
      }

      const handleStorageEvent = (event: StorageEvent): void => {
        if (event.key !== null && event.key !== STORAGE_KEY) {
          return
        }

        const value = isAppearancePreference(event.newValue)
          ? event.newValue
          : null

        if (value !== null) {
          listener(value)
        }
      }

      window.addEventListener("storage", handleStorageEvent)

      return () => {
        window.removeEventListener("storage", handleStorageEvent)
      }
    },
  }
}
