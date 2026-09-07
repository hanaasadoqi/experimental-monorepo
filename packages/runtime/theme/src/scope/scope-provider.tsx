"use client"

import {
  createScopeStore,
  type CreateScopeStoreOptions,
  useScopeAppearance,
} from "./scope-store"
import { ScopeContext } from "./scope-context"
import { applyCssToElement } from "@repo/adapters-theme-browser"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { useThemeCompilation } from ".."
import { ThemeOverrides } from "@repo/domain-theme"

export interface ThemeScopeProviderProps {
  scopeId: string
  overrides?: Partial<ThemeOverrides>
  options?: Omit<CreateScopeStoreOptions, "scopeId" | "initialEnableDarkMode">
  children: ReactNode
}

/**
 * Inner component that applies compiled CSS variables to the scope.
 * Must be inside ScopeContext so useThemeCompilation has access to the store.
 */
function ScopeStyleApplier({
  scopeId,
  scopeRef,
}: {
  scopeId: string
  scopeRef: React.RefObject<HTMLDivElement | null>
}) {
  const { cssVariables } = useThemeCompilation()

  useEffect(() => {
    if (!cssVariables || !scopeRef) return

    const el = scopeId === "root" ? document.documentElement : scopeRef.current
    if (!el) return

    applyCssToElement(el, cssVariables)
  }, [scopeId, scopeRef, cssVariables])

  return null
}

/**
 * Scoped theme provider: manages theme state, compiles CSS variables, and applies to DOM.
 *
 * Creates an isolated store per scope, rehydrates persisted state, compiles
 *  theme with overrides to CSS, and applies variables to the scope's DOM
 * element.
 */
export function ThemeScopeProvider({
  scopeId,
  overrides,
  options,
  children,
}: ThemeScopeProviderProps) {
  const enabled = (overrides?.enableDarkMode ?? false) as boolean
  const [store] = useState(() => {
    try {
      return createScopeStore({
        scopeId,
        initialEnableDarkMode: enabled,
        ...options,
      })
    } catch (cause) {
      throw new Error(`Failed to initialize theme scope "${scopeId}"`, {
        cause,
      })
    }
  })
  const [persistenceError, setPersistenceError] = useState<Error>()

  const { enableDarkMode, isDarkMode } = useScopeAppearance(store)

  const scopeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isActive = true

    void Promise.resolve(store.persist.rehydrate()).catch((cause: unknown) => {
      if (isActive) {
        setPersistenceError(
          new Error(`Failed to load persisted theme for scope "${scopeId}"`, {
            cause,
          })
        )
      }
    })

    return () => {
      isActive = false
    }
  }, [scopeId, store])

  if (persistenceError) throw persistenceError
  const themeId = store.getState().getThemeId()
  return (
    <ScopeContext.Provider value={store}>
      <ScopeStyleApplier scopeId={scopeId} scopeRef={scopeRef} />
      <div
        ref={scopeRef}
        data-scope-id={scopeId}
        id={scopeId}
        data-theme-id={themeId}
        data-theme={
          enableDarkMode ? (isDarkMode ? "dark" : "light") : undefined
        }
        className="theme-scope-provider"
      >
        {children}
      </div>
    </ScopeContext.Provider>
  )
}
