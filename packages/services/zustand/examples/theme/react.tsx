"use client"

import { createStoreContext, createStoreHook, useRehydrateStore } from "@repo/services-zustand/react"
import { useRef, type CSSProperties, type ReactNode } from "react"
import { createThemeScopeStore, type ThemeScopeStore } from "./store"

const scope = createStoreContext<ThemeScopeStore>("ThemeScopeStore")
export const useThemeScopeStore = createStoreHook(scope.useStoreApi)

export function ThemeScopeProvider({ scopeId, children }: { scopeId: string; children: ReactNode }) {
  const storeRef = useRef<ReturnType<typeof createThemeScopeStore> | null>(null)
  if (storeRef.current === null) storeRef.current = createThemeScopeStore(scopeId)
  useRehydrateStore(storeRef.current)
  return <scope.Provider value={storeRef.current}>{children}</scope.Provider>
}

export function ThemeForm() {
  const primaryColor = useThemeScopeStore((state) => state.overrides.primaryColor ?? "#000000")
  const setPrimaryColor = useThemeScopeStore((state) => state.setPrimaryColor)
  return <input type="color" value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} />
}

export function ThemePreview() {
  const primaryColor = useThemeScopeStore((state) => state.overrides.primaryColor)
  return <div style={{ "--primary": primaryColor } as CSSProperties}>Scoped preview</div>
}
