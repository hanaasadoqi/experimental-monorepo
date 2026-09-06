"use client"

import { createScopeStore, type CreateScopeStoreOptions } from "./scope-store"
import { ScopeContext } from "./scope-context"
import type { ResolvedAppearancePreference } from "@repo/domain-preferences"
import type { Theme } from "@repo/shared-contracts"
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react"
import { useThemeCompilation } from ".."

export interface ThemeScopeProviderProps {
  scopeId: string
  initialOverrides?: CreateScopeStoreOptions["initialOverrides"]
  theme?: Pick<Theme, "enableDarkMode">
  resolvedAppearance?: ResolvedAppearancePreference
  followResolvedAppearance?: boolean
  applyResolvedAppearance?: (appearance: ResolvedAppearancePreference) => void
  initialIsDarkMode?: CreateScopeStoreOptions["initialIsDarkMode"]
  onOverridesChange?: CreateScopeStoreOptions["persistOverrides"]
  onDarkModeChange?: CreateScopeStoreOptions["persistDarkMode"]
  getStorage?: CreateScopeStoreOptions["getStorage"]
  children: ReactNode
}

/**
 * Scoped theme provider: manages theme state, compiles CSS variables, and applies to DOM.
 *
 * Creates an isolated store per scope, rehydrates persisted state, compiles theme
 * with overrides to CSS, and applies variables to the scope's DOM element.
 * Syncs dark mode with system appearance preference if enabled.
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
  // Create store once on mount
  const [store] = useState(() =>
    createScopeStore({
      scopeId,
      initialOverrides,
      initialEnableDarkMode: theme?.enableDarkMode ?? false,
      initialIsDarkMode:
        initialIsDarkMode ??
        (theme?.enableDarkMode ? resolvedAppearance === "dark" : undefined),
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

  // Rehydrate persisted state
  useEffect(() => {
    void store.persist.rehydrate()
  }, [store])

  // Compile and apply CSS variables to DOM
  const { cssVariables } = useThemeCompilation()

  useEffect(() => {
    if (!cssVariables) return

    let observer: MutationObserver | undefined
    let retryTimeout: ReturnType<typeof setTimeout> | undefined

    const findElement = (): HTMLElement | null =>
      scopeId === "root"
        ? document.documentElement
        : document.querySelector<HTMLElement>(`[data-scope-id="${scopeId}"]`)

    const applyCSS = (): boolean => {
      const el = findElement()
      if (!el) return false

      Object.entries(cssVariables).forEach(([key, value]) => {
        el.style.setProperty(key, value as string)
      })
      return true
    }

    // Try immediately
    if (applyCSS()) return

    // Retry for scoped elements not yet in DOM
    if (scopeId === "root") return

    observer = new MutationObserver(() => {
      if (applyCSS()) {
        observer?.disconnect()
      }
    })
    observer.observe(document.documentElement, { childList: true, subtree: true })

    retryTimeout = setTimeout(() => {
      applyCSS()
      observer?.disconnect()
    }, 1000)

    return () => {
      observer?.disconnect()
      clearTimeout(retryTimeout)
    }
  }, [scopeId, cssVariables])

  // Sync dark mode with resolved appearance
  useEffect(() => {
    if (!enableDarkMode || !followResolvedAppearance) return

    const nextIsDarkMode = resolvedAppearance === "dark"
    if (isDarkMode !== nextIsDarkMode) {
      store.getState().setDarkMode(nextIsDarkMode)
    }
  }, [enableDarkMode, followResolvedAppearance, isDarkMode, resolvedAppearance, store])

  // Notify appearance changed
  useEffect(() => {
    if (!enableDarkMode || isDarkMode === undefined) return
    applyResolvedAppearance?.(isDarkMode ? "dark" : "light")
  }, [enableDarkMode, isDarkMode, applyResolvedAppearance])

  return (
    <ScopeContext.Provider value={store}>
      <div
        data-scope-id={scopeId}
        id={scopeId}
        data-theme-id={store.getState().getThemeId()}
        data-theme={enableDarkMode ? (isDarkMode ? "dark" : "light") : undefined}
        className="theme-scope-provider"
      >
        {children}
      </div>
    </ScopeContext.Provider>
  )
}
