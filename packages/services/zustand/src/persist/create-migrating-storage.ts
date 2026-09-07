import type { StateStorage } from "zustand/middleware"

/**
 * Wraps a storage adapter with legacy key migration support.
 *
 * When reading, checks for a current key first. If not found, falls back to
 * a legacy key and automatically migrates the data forward by writing to
 * the current key.
 *
 * This enables zero-friction schema migrations without requiring users to
 * manually clear their storage or handle transition logic.
 *
 * @param storage Base storage adapter to wrap
 * @param currentKey The new storage key
 * @param legacyKey The old storage key to migrate from
 * @returns Storage adapter with migration support
 *
 * @example
 * ```ts
 * const storage = createMigratingStorage(
 *   window.localStorage,
 *   "synapcity:themes:root",
 *   "synapcity:scope:root"  // old key
 * )
 * ```
 */
export function createMigratingStorage(
  storage: StateStorage,
  currentKey: string,
  legacyKey: string
): StateStorage {
  return {
    async getItem(name) {
      const currentValue = await storage.getItem(name)
      if (currentValue !== null) return currentValue

      // Only migrate if reading the current key (not other keys in same storage)
      if (name === currentKey) {
        const legacyValue = await storage.getItem(legacyKey)
        if (legacyValue !== null) {
          await storage.setItem(name, legacyValue)
        }
        return legacyValue
      }

      return null
    },
    setItem: (name, value) => storage.setItem(name, value),
    removeItem: (name) => storage.removeItem(name),
  }
}
