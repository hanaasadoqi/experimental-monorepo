"use client"

import { createStoreContext } from "@repo/services-zustand/react"

import type { PreferencesStore } from "../store"

const preferencesStoreContext = createStoreContext<PreferencesStore>(
  "PreferencesStoreContext"
)

export const PreferencesStoreContext = preferencesStoreContext.Context
export const PreferencesStoreContextProvider = preferencesStoreContext.Provider
export const usePreferencesStoreApi = preferencesStoreContext.useStoreApi
