import { createStore, type Mutate, type StoreApi } from "zustand/vanilla"
import { persist, type StateStorage } from "zustand/middleware"
import { createPersistOptions } from "@repo/services-zustand"
import { type ThemeOverrides } from "@repo/domain-theme"
// import { useSyncExternalStore, useRef } from "react"
import { ScopePersistenceValidators } from "./scope-validators"

const SCOPE_STORAGE_PREFIX = "synapcity:themes:"
const LEGACY_SCOPE_STORAGE_PREFIX = "synapcity:scope:"

export function getScopeStorageKey(scopeId: string): string {
  return `${SCOPE_STORAGE_PREFIX}${scopeId}`
}
export interface ScopeState {
  id: string
  scopeId: string
  overrides: ThemeOverrides
  enableDarkMode: boolean
  isDarkMode?: boolean
  sourceId?: string
}

export interface ScopeActions {
  getThemeId: () => string
  setOverrides: (overrides: ThemeOverrides) => void
  setPrimaryColor: (primary: string) => void
  setDarkMode: (isDarkMode: boolean) => void
  setEnableDarkMode: (
    enableDarkMode: boolean,
    initialIsDarkMode?: boolean
  ) => void
  toggleEnableDarkMode: (initialIsDarkMode?: boolean) => void
  toggleDarkMode: () => void
}

export type ScopeStore = ScopeState & ScopeActions

export type ScopeStoreApi = Mutate<
  StoreApi<ScopeStore>,
  [["zustand/persist", Omit<ScopeState, "scopeId">]]
>

/**
 * Dependency injection options for scope store.
 * Adapters are injected at creation time, keeping the store pure.
 */
export interface CreateScopeStoreOptions {
  scopeId: string
  /** Stable runtime identity supplied by React during SSR/hydration. */
  initialId?: string
  initialOverrides?: ThemeOverrides
  initialEnableDarkMode: boolean
  initialIsDarkMode?: boolean
  sourceId?: string
  version?: number
  /** Explicit storage implementation, primarily for tests and non-lazy use. */
  storage?: StateStorage
  /** Lazily resolve storage at hydration time without importing browser APIs. */
  getStorage?: () => StateStorage | undefined
}

/**
 * Create an isolated scope theme store with dependency-injected persistence.
 *
 * HYDRATION FLOW
 * ==============
 *
 * 1. FIRST RENDER (no localStorage data):
 *    - Store initializes with initialOverrides + initialEnableDarkMode
 *    - No persisted state, so Zustand persist middleware returns defaults
 *    - compile() is called immediately with initialOverrides
 *
 * 2. SUBSEQUENT RENDERS (with localStorage data):
 *    - Zustand hydrates persisted state via the merge() function
 *    - merge() reads and validates persisted values:
 *      a. readPersistedOverrides(): Extracts primary color (oklch string or object)
 *      b. readPersistedDarkMode(): Reads isDarkMode (boolean)
 *      c. readPersistedEnableDarkMode(): Reads dark mode preference
 *    - Merged state overrides currentState values
 *    - If merged state has custom primary, recompile is triggered
 *    - If merged state has custom isDarkMode, CSS variables are updated
 *
 * 3. VALIDATION:
 *    - readPersistedOverrides checks for "overrides.primary" field
 *    - readPersistedDarkMode handles both "isDarkMode" and legacy "isDarkModeEnabled"
 *    - Malformed values return undefined (graceful fallback to defaults)
 *
 * 4. MIGRATION:
 *    - createMigratingScopeStorage handles legacy storage keys
 *    - If new key not found, checks legacy key and migrates automatically
 *    - Versioned persistence allows future schema migrations
 *
 * MIGRATION SUPPORT
 * =================
 *
 * Legacy key migration is handled transparently via createMigratingStorage.
 * If the new storage key is not found, the storage adapter automatically checks
 * the legacy key and migrates data forward on first read.
 *
 * DEPENDENCY INJECTION
 * ===================
 *
 * getStorage: Lazy storage resolution (avoids importing browser APIs in SSR)
 * storage: Explicit storage for tests or non-lazy scenarios
 *
 * Usage:
 * ```ts
 * const store = createScopeStore({
 *   scopeId: "root",
 *   initialOverrides: { primary: "oklch(55% 0.1 200)" },
 *   initialEnableDarkMode: true,
 *   getStorage: () => window.localStorage,
 * })
 * ```
 *
 * @param options Configuration including scopeId, initial state, and adapters
 * @returns Zustand store API with persist middleware applied
 */
export function createScopeStore({
  sourceId,
  scopeId,
  initialId,
  initialOverrides = {},
  initialEnableDarkMode,
  initialIsDarkMode,
  version,
  storage,
  getStorage,
}: CreateScopeStoreOptions): ScopeStoreApi {
  return createStore<ScopeStore>()(
    persist<ScopeStore, [], [], Omit<ScopeState, "scopeId">>(
      (set, get) => ({
        id: initialId ?? crypto.randomUUID(),
        getThemeId: () => get().id,
        sourceId: sourceId ?? undefined,
        scopeId,
        overrides: initialOverrides,
        enableDarkMode: initialEnableDarkMode,
        isDarkMode: initialEnableDarkMode
          ? (initialIsDarkMode ?? false)
          : undefined,
        setOverrides: (overrides) => {
          set((state) => {
            const newOverrides = { ...state.overrides, ...overrides }
            return { overrides: newOverrides }
          })
        },
        setPrimaryColor: (primary) => {
          set((state) => {
            const newOverrides = {
              ...state.overrides,
              primary,
            } as ThemeOverrides
            return { overrides: newOverrides }
          })
        },
        setDarkMode: (isDarkMode) => {
          set((state) => {
            if (!state.enableDarkMode) return state
            return { isDarkMode }
          })
        },
        setEnableDarkMode: (enableDarkMode, fallbackIsDarkMode = false) => {
          set((state) => {
            const isDarkMode = enableDarkMode
              ? (state.isDarkMode ?? fallbackIsDarkMode)
              : undefined
            return { enableDarkMode, isDarkMode }
          })
        },
        toggleEnableDarkMode: (fallbackIsDarkMode = false) => {
          const state = get()
          state.setEnableDarkMode(!state.enableDarkMode, fallbackIsDarkMode)
        },
        toggleDarkMode: () => {
          set((state) => {
            if (!state.enableDarkMode) return state
            const isDarkMode = !state.isDarkMode
            return { isDarkMode }
          })
        },
      }),
      createScopePersistOptions({
        scopeId,
        storage,
        getStorage,
        version,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any
    )
  )
}

/**
 * Appearance selector hook for efficient subscriptions to dark mode state.
 *
 * Extracts only enableDarkMode and isDarkMode from the store, avoiding unnecessary
 * rerenders when other state (overrides, sourceId, etc.) changes.
 *
 * Manually tracks selected state and only notifies listeners when the selected
 * fields actually change. Memoizes the result object to maintain referential
 * stability, preventing unnecessary React rerenders.
 *
 * @param store The scope store instance
 * @returns Object with enableDarkMode and isDarkMode fields
 *
 * @example
 * ```tsx
 * function ScopeStyler({ store }: { store: ScopeStoreApi }) {
 *   const { enableDarkMode, isDarkMode } = useScopeAppearance(store)
 *   // Component only rerenders when dark mode state changes
 * }
 * ```
 */
// export function useScopeAppearance(store: ScopeStoreApi): {
//   enableDarkMode: boolean
//   isDarkMode: boolean | undefined
// } {
//   // Cache to maintain referential stability when values haven't changed
//   const appearanceCache = useRef<{
//     enableDarkMode: boolean
//     isDarkMode: boolean | undefined
//   } | null>(null)

//   return useSyncExternalStore(
//     // Subscribe function: register a listener for appearance changes
//     (onStoreChange) => {
//       // Initialize with current state
//       let previousAppearance = {
//         enableDarkMode: store.getState().enableDarkMode,
//         isDarkMode: store.getState().isDarkMode,
//       }

//       // Subscribe to all store changes
//       return store.subscribe((state) => {
//         // Extract current appearance fields
//         const currentAppearance = {
//           enableDarkMode: state.enableDarkMode,
//           isDarkMode: state.isDarkMode,
//         }

//         // Only notify listener if appearance actually changed (shallow equality)
//         if (
//           previousAppearance.enableDarkMode !==
//             currentAppearance.enableDarkMode ||
//           previousAppearance.isDarkMode !== currentAppearance.isDarkMode
//         ) {
//           previousAppearance = currentAppearance
//           onStoreChange()
//         }
//       })
//     },
//     // Get snapshot (called on client): extract current appearance from store
//     // Memoized to prevent infinite rerenders from new object instances
//     () => {
//       const state = store.getState()
//       const current = {
//         enableDarkMode: state.enableDarkMode,
//         isDarkMode: state.isDarkMode,
//       }

//       // Return cached instance if values haven't changed (referential stability)
//       if (
//         appearanceCache.current &&
//         appearanceCache.current.enableDarkMode === current.enableDarkMode &&
//         appearanceCache.current.isDarkMode === current.isDarkMode
//       ) {
//         return appearanceCache.current
//       }

//       // Update cache with new instance when values change
//       appearanceCache.current = current
//       return current
//     },
//     // Get server snapshot (called on SSR): extract initial appearance from store
//     () => {
//       const state = store.getInitialState()
//       return {
//         enableDarkMode: state.enableDarkMode,
//         isDarkMode: state.isDarkMode,
//       }
//     }
//   )
// }

/**
 * Creates persist middleware options for a scope store.
 * Wraps the generic createPersistOptions factory with scope-specific state validation and serialization.
 */
function createScopePersistOptions({
  scopeId,
  storage,
  getStorage,
  version = 1,
}: Pick<CreateScopeStoreOptions, "scopeId" | "storage" | "getStorage"> & {
  version?: number
}) {
  return createPersistOptions<Omit<ScopeState, "scopeId">, Partial<ScopeState>>(
    {
      name: getScopeStorageKey(scopeId),
      legacyName: `${LEGACY_SCOPE_STORAGE_PREFIX}${scopeId}`,
      version,
      storage,
      getStorage,
      migrate: (persistedState: unknown) =>
        persistedState as Omit<ScopeState, "scopeId">,
      partialize: ({
        id,
        overrides,
        enableDarkMode,
        isDarkMode,
      }: Partial<ScopeState>) => ({
        id,
        overrides,
        enableDarkMode,
        ...(isDarkMode !== undefined && { isDarkMode }),
      }),

      merge: (
        persistedState: unknown,
        currentState: Omit<ScopeState, "scopeId">
      ) => {
        const persistedThemeId =
          ScopePersistenceValidators.readThemeId(persistedState)
        const persistedOverrides =
          ScopePersistenceValidators.readOverrides(persistedState)
        const persistedDarkMode =
          ScopePersistenceValidators.readDarkMode(persistedState)
        const persistedEnableDarkMode =
          ScopePersistenceValidators.readEnableDarkMode(persistedState)
        const enableDarkMode =
          persistedEnableDarkMode ?? currentState.enableDarkMode

        return {
          ...currentState,
          id: persistedThemeId ?? currentState.id,
          enableDarkMode,
          overrides:
            persistedOverrides === undefined
              ? currentState.overrides
              : { ...currentState.overrides, ...persistedOverrides },
          isDarkMode: enableDarkMode
            ? (persistedDarkMode ?? currentState.isDarkMode ?? false)
            : undefined,
        }
      },
    }
  )
}
