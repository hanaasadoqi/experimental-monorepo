import { createStore, type Mutate, type StoreApi } from "zustand/vanilla"
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware"
import { PrimaryThemeColor, ThemeOverrides } from "@repo/domain-theme"

const SCOPE_STORAGE_PREFIX = "synapcity:themes:"
const LEGACY_SCOPE_STORAGE_PREFIX = "synapcity:scope:"

export function getScopeStorageKey(scopeId: string): string {
  return `${SCOPE_STORAGE_PREFIX}${scopeId}`
}

function readPersistedOverrides(value: unknown): ThemeOverrides | undefined {
  if (typeof value !== "object" || value === null || !("overrides" in value)) {
    return undefined
  }

  const overrides = value.overrides
  if (typeof overrides !== "object" || overrides === null) {
    return undefined
  }

  if (!("primary" in overrides)) {
    return {}
  }

  // primary field can be an oklch string or color object from the domain schema
  if (
    typeof overrides.primary === "string" ||
    (typeof overrides.primary === "object" && overrides.primary !== null)
  ) {
    return { primary: overrides.primary as unknown as PrimaryThemeColor }
  }
  return {}
}

/**
 * Extract isDarkMode from persisted state, handling both current and legacy keys.
 * @param value Raw persisted state object
 * @returns Boolean if valid, undefined if missing or invalid
 */
function readPersistedDarkMode(value: unknown): boolean | undefined {
  if (typeof value !== "object" || value === null) return undefined

  const persisted = value as {
    isDarkMode?: unknown
    isDarkModeEnabled?: unknown
  }
  const isDarkMode = persisted.isDarkMode ?? persisted.isDarkModeEnabled
  return typeof isDarkMode === "boolean" ? isDarkMode : undefined
}

/**
 * Extract enableDarkMode from persisted state.
 * @param value Raw persisted state object
 * @returns Boolean if valid, undefined if missing or invalid
 */
function readPersistedEnableDarkMode(value: unknown): boolean | undefined {
  if (
    typeof value !== "object" ||
    value === null ||
    !("enableDarkMode" in value)
  ) {
    return undefined
  }

  return typeof value.enableDarkMode === "boolean"
    ? value.enableDarkMode
    : undefined
}

export interface ScopeState {
  scopeId: string
  overrides: ThemeOverrides
  enableDarkMode: boolean
  isDarkMode?: boolean
}

export interface ScopeActions {
  // primary accepts oklch color string (e.g., "oklch(55% 0.1 200)")
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
  initialOverrides?: ThemeOverrides
  initialEnableDarkMode: boolean
  initialIsDarkMode?: boolean
  /**
   * Called when overrides change. Adapter receives the overrides to persist.
   * Examples: localStorage write, cookie write, API call
   */
  persistOverrides?: (overrides: ThemeOverrides) => void | Promise<void>
  /**
   * Called when dark mode preference changes. Adapter receives the dark mode state.
   */
  persistDarkMode?: (isDarkMode: boolean | undefined) => void | Promise<void>
  /** Explicit storage implementation, primarily for tests and non-lazy use. */
  storage?: StateStorage
  /** Lazily resolve storage at hydration time without importing browser APIs. */
  getStorage?: () => StateStorage | undefined
}

function createDeferredStorage(
  getStorage: () => StateStorage | undefined
): StateStorage {
  return {
    getItem: (name) => getStorage()?.getItem(name) ?? null,
    setItem: (name, value) => getStorage()?.setItem(name, value),
    removeItem: (name) => getStorage()?.removeItem(name),
  }
}

function createMigratingScopeStorage(
  storage: StateStorage,
  scopeId: string
): StateStorage {
  const legacyKey = `${LEGACY_SCOPE_STORAGE_PREFIX}${scopeId}`

  return {
    async getItem(name) {
      const currentValue = await storage.getItem(name)
      if (currentValue !== null) return currentValue

      const legacyValue = await storage.getItem(legacyKey)
      if (legacyValue !== null) {
        await storage.setItem(name, legacyValue)
      }
      return legacyValue
    },
    setItem: (name, value) => storage.setItem(name, value),
    removeItem: (name) => storage.removeItem(name),
  }
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
 *    - version: 1 allows future schema migrations
 *
 * PERSISTENCE CALLBACKS
 * ====================
 *
 * The store is pure—it doesn't know how persistence works:
 * - persistOverrides: Called when primary color changes (adapter handles write)
 * - persistDarkMode: Called when dark mode preference changes (adapter handles write)
 * - Adapters can be localStorage, cookies, API calls, etc.
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
 *   persistOverrides: (overrides) => saveToServer(overrides),
 * })
 * ```
 *
 * @param options Configuration including scopeId, initial state, and adapters
 * @returns Zustand store API with persist middleware applied
 */
export function createScopeStore({
  scopeId,
  initialOverrides = {},
  initialEnableDarkMode,
  initialIsDarkMode,
  persistOverrides,
  persistDarkMode,
  storage,
  getStorage,
}: CreateScopeStoreOptions): ScopeStoreApi {
  const scopeStorage = storage ?? createDeferredStorage(() => getStorage?.())

  return createStore<ScopeStore>()(
    persist<ScopeStore, [], [], Omit<ScopeState, "scopeId">>(
      (set, get) => ({
        scopeId,
        overrides: initialOverrides,
        enableDarkMode: initialEnableDarkMode,
        isDarkMode: initialEnableDarkMode
          ? (initialIsDarkMode ?? false)
          : undefined,
        setPrimaryColor: (primary) => {
          set((state) => {
            const newOverrides = {
              ...state.overrides,
              primary,
            } as ThemeOverrides
            persistOverrides?.(newOverrides)
            return { overrides: newOverrides }
          })
        },
        setDarkMode: (isDarkMode) => {
          set((state) => {
            if (!state.enableDarkMode) return state
            persistDarkMode?.(isDarkMode)
            return { isDarkMode }
          })
        },
        setEnableDarkMode: (enableDarkMode, fallbackIsDarkMode = false) => {
          set((state) => {
            const isDarkMode = enableDarkMode
              ? (state.isDarkMode ?? fallbackIsDarkMode)
              : undefined
            persistDarkMode?.(isDarkMode)
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
            persistDarkMode?.(isDarkMode)
            return { isDarkMode }
          })
        },
      }),
      {
        name: getScopeStorageKey(scopeId),
        version: 1,
        storage: createJSONStorage(() =>
          createMigratingScopeStorage(scopeStorage, scopeId)
        ),
        partialize: ({ overrides, enableDarkMode, isDarkMode }) => ({
          overrides,
          enableDarkMode,
          ...(isDarkMode !== undefined && { isDarkMode }),
        }),
        merge: (persistedState, currentState) => {
          const persistedOverrides = readPersistedOverrides(persistedState)
          const persistedDarkMode = readPersistedDarkMode(persistedState)
          const persistedEnableDarkMode =
            readPersistedEnableDarkMode(persistedState)
          const enableDarkMode =
            persistedEnableDarkMode ?? currentState.enableDarkMode

          return {
            ...currentState,
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
        skipHydration: true,
      }
    )
  )
}
