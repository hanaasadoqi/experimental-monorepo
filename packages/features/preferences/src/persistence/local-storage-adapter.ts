import { appearancePreferenceSchema } from "@repo/shared-contracts"

import { APPEARANCE_PREFERENCE_STORAGE_KEY } from "./constants"
import type { PreferencesPersistenceAdapter } from "./types"

function getStorage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage
  } catch {
    return null
  }
}

export function createLocalStoragePreferencesAdapter(): PreferencesPersistenceAdapter {
  return {
    read() {
      try {
        const result = appearancePreferenceSchema.safeParse(
          getStorage()?.getItem(APPEARANCE_PREFERENCE_STORAGE_KEY)
        )
        return result.success ? result.data : null
      } catch {
        return null
      }
    },
    write(preference) {
      try {
        getStorage()?.setItem(APPEARANCE_PREFERENCE_STORAGE_KEY, preference)
      } catch {
        // Persistence failure must not invalidate active in-memory preferences.
      }
    },
    subscribe(listener) {
      if (
        typeof window === "undefined" ||
        typeof window.addEventListener !== "function"
      ) {
        return () => undefined
      }

      const handleStorage = (event: StorageEvent): void => {
        if (
          event.key !== null &&
          event.key !== APPEARANCE_PREFERENCE_STORAGE_KEY
        ) {
          return
        }

        const result = appearancePreferenceSchema.safeParse(event.newValue)
        if (result.success) {
          listener(result.data)
        }
      }

      window.addEventListener("storage", handleStorage)
      return () => window.removeEventListener("storage", handleStorage)
    },
  }
}
