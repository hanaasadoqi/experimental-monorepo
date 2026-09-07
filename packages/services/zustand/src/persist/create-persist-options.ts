import type { StateStorage } from "zustand/middleware"
import { createJSONStorage, type PersistOptions } from "zustand/middleware"
import { createMigratingStorage } from "./create-migrating-storage"

/**
 * Generic persist middleware options builder.
 * Handles SSR-safe storage initialization, key-based migration, and custom serialization/deserialization.
 */
export interface CreatePersistOptionsConfig<TState, TPersistedState> {
  /** Primary storage key name */
  name: string
  /** Legacy storage key for fallback migration (optional) */
  legacyName?: string
  /** Persist version for schema migrations */
  version?: number
  /** Explicit storage implementation (e.g., for tests) */
  storage?: StateStorage
  /** Lazy storage resolution (called at hydration time) */
  getStorage?: () => StateStorage | undefined
  /** Custom state validation/transformation on hydration */
  migrate?: (
    persistedState: unknown,
    persistedVersion: number
  ) => TPersistedState | Promise<TPersistedState>
  /** Select which fields to persist */
  partialize: (state: TState) => TPersistedState
  /** Merge persisted state into current state with custom validation */
  merge: (persistedState: unknown, currentState: TState) => TState
}

/**
 * Create Zustand persist middleware options with sensible defaults for storage handling and migration.
 * Automatically configures SSR-safe lazy storage, key-based migration fallback, and serialization.
 *
 * @example
 * ```ts
 * const store = create<MyStore>()(
 *   persist(
 *     (set) => ({ ... }),
 *     createPersistOptions({
 *       name: "my-store",
 *       legacyName: "old-my-store",
 *       version: 2,
 *       getStorage: () => window.localStorage,
 *       partialize: (state) => ({ id: state.id }),
 *       merge: (persisted, current) => ({ ...current, ...persisted }),
 *     })
 *   )
 * )
 * ```
 */
export function createPersistOptions<TState, TPersistedState>({
  name,
  legacyName,
  version = 1,
  storage,
  getStorage,
  migrate,
  partialize,
  merge,
}: CreatePersistOptionsConfig<TState, TPersistedState>): PersistOptions<
  TState,
  TPersistedState,
  unknown
> {
  return {
    name,
    version,
    ...(migrate && { migrate }),
    storage: createJSONStorage(() => {
      const baseStorage = storage ?? getStorage?.()
      if (!baseStorage) {
        // SSR safety: no-op storage when browser APIs unavailable
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }
      // Auto-migrate from legacy key if present
      if (legacyName) {
        return createMigratingStorage(baseStorage, name, legacyName)
      }
      return baseStorage
    }),
    partialize,
    merge,
    skipHydration: true,
  }
}
