"use client"

import { createContext, useContext } from "react"

import type { PreferencesStoreApi } from "../store"

export const PreferencesStoreContext =
  createContext<PreferencesStoreApi | null>(null)

PreferencesStoreContext.displayName = "PreferencesStoreContext"

export function usePreferencesStoreApi(): PreferencesStoreApi {
  const store = useContext(PreferencesStoreContext)

  if (store === null) {
    throw new Error(
      "PreferencesStoreContext is unavailable. " +
        "Ensure this component is rendered within PreferencesProvider."
    )
  }

  return store
}
