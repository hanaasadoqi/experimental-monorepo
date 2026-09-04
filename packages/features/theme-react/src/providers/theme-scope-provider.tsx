"use client"

import { createContext, useContext, useRef, type ReactNode } from "react"
import type { ThemeScopeStoreApi } from "@repo/runtime-theme"
import { createThemeScopeStore } from "@repo/runtime-theme"
import { useScopedAppearance } from "../hooks/use-scoped-appearance"

interface ThemeScopeContextValue {
  store: ThemeScopeStoreApi
  scopeId: string
}

const ThemeScopeContext = createContext<ThemeScopeContextValue | undefined>(
  undefined
)

export interface ThemeScopeProviderProps {
  scopeId: string
  children: ReactNode
  initialDarkMode?: boolean
  className?: string
}

/**
 * Provides a scoped theme context that allows overriding colors and dark mode
 * for a subtree of components. The scoped dark mode only applies when explicitly set;
 * when undefined, the scope inherits the root document's theme.
 */
export function ThemeScopeProvider({
  scopeId,
  children,
  initialDarkMode,
  className,
}: ThemeScopeProviderProps) {
  const storeRef = useRef<ThemeScopeStoreApi | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)

  if (storeRef.current === null) {
    storeRef.current = createThemeScopeStore({
      scopeId,
      initialDarkMode,
    })
  }

  useScopedAppearance(storeRef.current, elementRef.current)

  return (
    <ThemeScopeContext.Provider value={{ store: storeRef.current, scopeId }}>
      <div ref={elementRef} className={className}>
        {children}
      </div>
    </ThemeScopeContext.Provider>
  )
}

/**
 * Hook to access the scoped theme store from within a ThemeScopeProvider.
 * Allows reading and mutating color overrides and dark mode settings.
 */
export function useThemeScopeStore(): ThemeScopeStoreApi {
  const context = useContext(ThemeScopeContext)
  if (!context) {
    throw new Error(
      "useThemeScopeStore must be used within a ThemeScopeProvider"
    )
  }
  return context.store
}

/**
 * Hook to access the scope ID from within a ThemeScopeProvider.
 */
export function useThemeScopeId(): string {
  const context = useContext(ThemeScopeContext)
  if (!context) {
    throw new Error("useThemeScopeId must be used within a ThemeScopeProvider")
  }
  return context.scopeId
}
