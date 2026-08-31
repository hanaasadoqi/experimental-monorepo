"use client"

import {
  createStoreContext,
  createStoreHook,
} from "@repo/services-zustand/react"

import type { ThemeScopeStore } from "../../store"

const themeScopeContext = createStoreContext<ThemeScopeStore>(
  "ThemeScopeStoreContext"
)

export const ThemeScopeStoreContextProvider = themeScopeContext.Provider
export const useThemeScopeStoreApi = themeScopeContext.useStoreApi
export const useThemeScopeStore = createStoreHook<ThemeScopeStore>(
  useThemeScopeStoreApi
)
