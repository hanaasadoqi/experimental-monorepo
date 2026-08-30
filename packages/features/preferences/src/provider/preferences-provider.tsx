"use client"

import { createContext, useContext, useRef, type ReactNode } from "react"
import type { StoreApi } from "zustand/vanilla"

import { DEFAULT_APPEARANCE_PREFERENCE } from "@repo/shared-contracts/defaults"
import type { AppearancePreference } from "@repo/shared-contracts"

import type { PreferencesState } from "../types"
import { createPreferencesStore } from "../store"

export interface PreferencesProviderProps {
  children: ReactNode
  initialAppearance?: AppearancePreference
}

export const PreferencesContext = createContext<PreferencesState | null>(null)

export function PreferencesProvider({
  children,
  initialAppearance = DEFAULT_APPEARANCE_PREFERENCE,
}: PreferencesProviderProps) {
  const storeRef = useRef<StoreApi<PreferencesState> | null>(null)

  if (storeRef.current === null) {
    storeRef.current = createPreferencesStore(initialAppearance)
  }

  const state = storeRef.current?.getState()

  return (
    <PreferencesContext.Provider value={state ?? null}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences(): PreferencesState {
  const context = useContext(PreferencesContext)

  if (context === null) {
    throw new Error("usePreferences must be used within a PreferencesProvider")
  }

  return {
    appearance: context.appearance,
    setAppearance: context.setAppearance,
  }
}
