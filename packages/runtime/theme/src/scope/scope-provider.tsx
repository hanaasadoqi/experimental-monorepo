"use client"

import { createScopeStore, type CreateScopeStoreOptions } from "./scope-store"
import { ScopeContext } from "./scope-context"
import type { ResolvedAppearancePreference } from "@repo/domain-preferences"
import type { Theme } from "@repo/shared-contracts"
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { useThemeCompilation } from "..";

export interface ThemeScopeProviderProps {
  /** Unique identifier for this scope */
  scopeId: string
  /** Initial color overrides */
  initialOverrides?: CreateScopeStoreOptions["initialOverrides"]
  /** Selected theme; its capability controls appearance-driven dark mode. */
  theme?: Pick<Theme, "enableDarkMode">
  /** Concrete appearance used to initialize an enabled scope's mode. */
  resolvedAppearance?: ResolvedAppearancePreference
  /** Keep this scope synchronized when resolved appearance changes. Root only. */
  followResolvedAppearance?: boolean
  /** Injected environment adapter for applying the concrete appearance. */
  applyResolvedAppearance?: (appearance: ResolvedAppearancePreference) => void
  /** Initial rendered state for a scope without a resolved appearance. */
  initialIsDarkMode?: CreateScopeStoreOptions["initialIsDarkMode"]
  /** Adapter: how to persist overrides. Default: localStorage */
  onOverridesChange?: CreateScopeStoreOptions["persistOverrides"]
  /** Adapter: how to persist dark mode. Default: localStorage */
  onDarkModeChange?: CreateScopeStoreOptions["persistDarkMode"]
  /** Lazily injected environment storage. Omit for an in-memory scope. */
  getStorage?: CreateScopeStoreOptions["getStorage"]
  children: ReactNode
}

/**
 * Provider for scoped theme state and side effects.
 *
 * Handles:
 * - Creating isolated Zustand store per scopeId
 * - Rehydrating injected persisted state after hydration
 * - Coordinating with adapters for persistence
 * - Providing store to child components via context
 *
 * Usage:
 * ```tsx
 * <ThemeScopeProvider
 *   scopeId="preview"
 *   onOverridesChange={(o) => console.log("overrides changed", o)}
 *   onDarkModeChange={(d) => console.log("dark mode changed", d)}
 * >
 *   <ScopedThemeToggle />
 *   <PreviewContent />
 * </ThemeScopeProvider>
 * ```
 *
 * Pattern (from beste-ui):
 * 1. Store factory is called once at mount, creating a stable store instance
 * 2. Adapters (persistence, DOM sync) are passed as dependencies
 * 3. useEffect rehydrates persisted state explicitly (skipHydration: true)
 * 4. Store is provided via context (no direct .getState() in components)
 * 5. Components use useThemeScope hook (not context directly)
 *
 * This provider does not promise pre-paint local-storage restoration. A future
 * environment adapter may supply that behavior without duplicating runtime
 * state rules.
 */
export function ThemeScopeProvider({
  scopeId,
  initialOverrides,
  theme,
  resolvedAppearance,
  followResolvedAppearance = false,
  applyResolvedAppearance,
  initialIsDarkMode,
  onOverridesChange,
  onDarkModeChange,
  getStorage,
  children,
}: ThemeScopeProviderProps) {
  const initializedIsDarkMode =
    initialIsDarkMode ??
    (theme?.enableDarkMode ? resolvedAppearance === "dark" : undefined)

  // Create store once on mount, stable across re-renders
  const [store] = useState(() =>
    createScopeStore({
      scopeId,
      initialOverrides,
      initialEnableDarkMode: theme?.enableDarkMode ?? false,
      initialIsDarkMode: initializedIsDarkMode,
      persistOverrides: onOverridesChange,
      persistDarkMode: onDarkModeChange,
      getStorage,
    })
  )
  const { enableDarkMode, isDarkMode } = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getInitialState
  )

  // Rehydrate persisted state from storage + bootstrap data
  // Bootstrap script (if present) already applied scope to DOM before React loaded
  // This effect syncs React store with what bootstrap did
  // Theme definition (overrides) is persisted and restored by Zustand's persist middleware
  // CSS variables are recompiled on render from the restored theme definition
  useEffect(() => {
    void store.persist.rehydrate()

    // Persist initial theme overrides to localStorage
    // (so they're available on next page load even if never changed)
    const state = store.getState()
    if (state.overrides && Object.keys(state.overrides).length > 0) {
      try {
        const storageKey = `synapcity:themes:${scopeId}`
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            state: {
              overrides: state.overrides,
              enableDarkMode: state.enableDarkMode,
              isDarkMode: state.isDarkMode,
              scopeId
            },
            version: 0,
          })
        )
      } catch (e) {
        // localStorage might not be available
        console.warn("Failed to persist initial theme overrides:", e)
      }
    }
  }, [store, scopeId])

  // Call the compilation hook at top level to get CSS variables and merged theme
  // This computes the merged theme (source + overrides) and compiles to CSS
  const { cssVariables } = useThemeCompilation()

  // Apply compiled CSS variables to DOM and handle element detection/retry
  useEffect(() => {
    let observer: MutationObserver | undefined
    let retryTimeout: ReturnType<typeof setTimeout> | undefined

    const findTargetElement = (): HTMLElement | null => {
      if (scopeId === "root") {
        return document.documentElement
      }
      return document.querySelector<HTMLElement>(`[data-scope-id="${scopeId}"]`)
    }

    const applyCSS = (): boolean => {
      if (!cssVariables) return false

      const targetElement = findTargetElement()
      if (!targetElement) {
        return false
      }

      // Apply CSS variables to target element
      for (const [key, value] of Object.entries(cssVariables)) {
        targetElement.style.setProperty(key, value as string)
      }

      return true
    }

    const setupRetry = () => {
      // For root scope, element always exists - no retry needed
      if (scopeId === "root") return

      // Set up MutationObserver to detect when scope element is added to DOM
      observer = new MutationObserver(() => {
        if (applyCSS()) {
          observer?.disconnect()
          observer = undefined
        }
      })

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      })

      // Fallback: retry via interval in case observer misses the mutation
      retryTimeout = setTimeout(() => {
        if (applyCSS()) {
          observer?.disconnect()
          observer = undefined
        }
      }, 1000)
    }

    // Try to apply CSS immediately
    const applied = applyCSS()
    if (!applied && scopeId !== "root") {
      // Element not found, set up retry for scoped themes
      setupRetry()
    }

    return () => {
      observer?.disconnect()
      if (retryTimeout) clearTimeout(retryTimeout)
    }
  }, [scopeId, cssVariables])

  useEffect(() => {
    if (
      !enableDarkMode ||
      (!followResolvedAppearance && isDarkMode !== undefined)
    ) {
      return
    }

    const nextIsDarkMode = resolvedAppearance === "dark"
    if (isDarkMode !== nextIsDarkMode) {
      store.getState().setDarkMode(nextIsDarkMode)
    }
  }, [
    followResolvedAppearance,
    isDarkMode,
    resolvedAppearance,
    store,
    enableDarkMode,
  ])

  useEffect(() => {
    if (!enableDarkMode || isDarkMode === undefined) return

    applyResolvedAppearance?.(isDarkMode ? "dark" : "light")
  }, [applyResolvedAppearance, enableDarkMode, isDarkMode])

  return (
    <ScopeContext.Provider value={store}>
      <div
        data-scope-id={scopeId}
        data-theme-id={store.getState().getThemeId()}
        {...(!enableDarkMode ? undefined : { "data-theme": isDarkMode ? "dark" : "light" })}
        className="theme-scope-provider"
        id={scopeId}
      >
        {children}
      </div>
    </ScopeContext.Provider>
  )

}
