"use client"

import { createScopeStore, type CreateScopeStoreOptions } from "./scope-store"
import { ScopeContext } from "./scope-context"
import type { ResolvedAppearancePreference } from "@repo/domain-preferences"
import type { Theme } from "@repo/shared-contracts"
import { compile } from "@repo/domain-theme/compiler"
import type { ThemeCompilationInput } from "@repo/domain-theme/compiler"
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"

export interface ThemeScopeProviderProps {
  /** Unique identifier for this scope */
  scopeId: string
  /** Initial color overrides */
  initialOverrides?: CreateScopeStoreOptions["initialOverrides"]
  /** Selected theme; its capability controls appearance-driven dark mode. */
  theme: Pick<Theme, "enableDarkMode">
  /** Concrete appearance used to initialize an enabled scope's mode. */
  resolvedAppearance: ResolvedAppearancePreference
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
    (theme.enableDarkMode ? resolvedAppearance === "dark" : undefined)

  // Create store once on mount, stable across re-renders
  const [store] = useState(() =>
    createScopeStore({
      scopeId,
      initialOverrides,
      initialEnableDarkMode: theme.enableDarkMode,
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
  useEffect(() => {
    void store.persist.rehydrate()

    // Restore root theme CSS variables from localStorage (if available)
    // This prevents flashing unstyled content on page reload
    if (scopeId === "root") {
      try {
        const persisted = localStorage.getItem("theme-scope-root")
        if (persisted) {
          const parsed = JSON.parse(persisted) as {
            cssVariables?: Record<string, string>
          }
          if (parsed.cssVariables && document.documentElement) {
            for (const [key, value] of Object.entries(parsed.cssVariables)) {
              document.documentElement.style.setProperty(key, value)
            }
          }
        }
      } catch (e) {
        // Ignore parsing or localStorage errors
      }
    }
  }, [store, scopeId])

  // Compile theme and apply CSS variables to DOM
  // Watches scope state (primary color, isDarkMode) and regenerates CSS on changes
  // Retries finding scoped elements if not immediately available (e.g., async mount)
  useEffect(() => {
    let observer: MutationObserver | undefined
    let retryTimeout: ReturnType<typeof setTimeout> | undefined

    const findTargetElement = (): HTMLElement | null => {
      if (scopeId === "root") {
        return document.documentElement
      }
      return document.querySelector<HTMLElement>(`[data-scope-id="${scopeId}"]`)
    }

    const compileAndApply = (compilationState: ReturnType<typeof store.getState>) => {
      const primary = compilationState.overrides.primary
      if (!primary) return false

      const input: ThemeCompilationInput = {
        primary,
        isDarkMode: compilationState.isDarkMode,
      }

      const result = compile(input)

      if (!result.report.success) {
        console.warn(
          `[ThemeCompilation] Failed to compile theme for scope "${scopeId}":`,
          result.report.errors
        )
        return false
      }

      const targetElement = findTargetElement()
      if (!targetElement) {
        return false // Element not found, will retry
      }

      // Apply CSS variables
      for (const [key, value] of Object.entries(result.cssVariables)) {
        targetElement.style.setProperty(key, value)
      }

      // Persist compiled theme to localStorage for root scope
      // (so CSS variables are available on next page load)
      if (scopeId === "root") {
        try {
          localStorage.setItem(
            "theme-scope-root",
            JSON.stringify({
              cssVariables: result.cssVariables,
              isDarkMode: compilationState.isDarkMode,
              timestamp: Date.now(),
            })
          )
        } catch (e) {
          // localStorage might not be available
          console.warn("Failed to persist theme CSS variables:", e)
        }
      }

      return true
    }

    const setupRetry = () => {
      // For root scope, element always exists - no retry needed
      if (scopeId === "root") return

      // Set up MutationObserver to detect when scope element is added to DOM
      observer = new MutationObserver(() => {
        if (compileAndApply(store.getState())) {
          // Success! Element found and CSS applied
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
        if (compileAndApply(store.getState())) {
          observer?.disconnect()
          observer = undefined
        }
      }, 1000)
    }

    // Try immediately on mount
    const initialState = store.getState()
    if (initialState.overrides.primary) {
      const applied = compileAndApply(initialState)
      if (!applied && scopeId !== "root") {
        // Element not found, set up retry for scoped themes
        setupRetry()
      }
    }

    // Subscribe to store changes and recompile
    const unsubscribe = store.subscribe((state) => {
      if (!state.overrides.primary) return

      const applied = compileAndApply(state)
      if (!applied && scopeId !== "root" && !observer) {
        // Element disappeared or not found, retry
        setupRetry()
      } else if (applied && observer) {
        // Success, cleanup observer
        observer.disconnect()
        observer = undefined
        if (retryTimeout) clearTimeout(retryTimeout)
      }
    })

    return () => {
      unsubscribe()
      observer?.disconnect()
      if (retryTimeout) clearTimeout(retryTimeout)
    }
  }, [store, scopeId])

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

  return <ScopeContext.Provider value={store}>{children}</ScopeContext.Provider>
}
