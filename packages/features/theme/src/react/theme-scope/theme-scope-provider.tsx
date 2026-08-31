"use client"

import { useRehydrateStore } from "@repo/services-zustand/react"
import { useId, useRef, type CSSProperties, type ReactNode } from "react"
import type { StateStorage } from "zustand/middleware"

import type { ThemeOverrides } from "../../model/colors"
import { createThemeScopeStore, type ThemeScopeStoreApi } from "../../store"

import {
  ThemeScopeStoreContextProvider,
  useThemeScopeStore,
} from "./theme-scope-context"

export const DEFAULT_THEME_PRIMARY_COLOR = "#2563eb"

export interface ThemeScopeProviderProps {
  children: ReactNode
  scopeId: string
  initialOverrides?: ThemeOverrides
  storage?: StateStorage
}

interface ThemeScopeBoundaryProps {
  children: ReactNode
  scopeId: string
}

function ThemeScopeBoundary({ children, scopeId }: ThemeScopeBoundaryProps) {
  const resolvedId = useId()
  const primaryColor = useThemeScopeStore(
    (state) => state.overrides.primaryColor
  )
  const style = {
    "--ds-color-primary": primaryColor ?? DEFAULT_THEME_PRIMARY_COLOR,
  } as CSSProperties

  // const contrastColor = useThemeScopeStore((state) => state.overrides.contrastColor)

  return (
    <div
      data-theme-id={resolvedId}
      data-scope-id={scopeId}
      data-testid={`theme-scope-${scopeId}`}
      style={style}
    >
      {children}
    </div>
  )
}

export function ThemeScopeProvider({
  children,
  scopeId,
  initialOverrides,
  storage,
}: ThemeScopeProviderProps) {
  const storeRef = useRef<ThemeScopeStoreApi | null>(null)

  if (storeRef.current === null) {
    storeRef.current = createThemeScopeStore({
      scopeId,
      initialOverrides,
      storage,
    })
  }

  useRehydrateStore(storeRef.current)

  return (
    <ThemeScopeStoreContextProvider value={storeRef.current}>
      <ThemeScopeBoundary scopeId={scopeId}>{children}</ThemeScopeBoundary>
    </ThemeScopeStoreContextProvider>
  )
}
