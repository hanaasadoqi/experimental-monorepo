"use client"

import {
  createStoreContext,
  createStoreHook,
  createStoreProvider,
  useRehydrateStore,
  useStoreHydration,
} from "@repo/services-zustand/react"
import { subscribeToStorageRehydration } from "@repo/services-zustand/persist"
import { useEffect } from "react"
import { createPreferencesStore, type PreferencesStore } from "./store"

const context = createStoreContext<PreferencesStore>("PreferencesStore")
export const usePreferencesStore = createStoreHook(context.useStoreApi)

export const PreferencesProvider = createStoreProvider({
  createStore: ({
    initialAppearance,
  }: {
    initialAppearance?: "light" | "dark" | "system"
  }) =>
    createPreferencesStore(
      initialAppearance ? { appearance: initialAppearance } : undefined
    ),
  Provider: context.Provider,
})

export function PreferencesRuntime() {
  const store = context.useStoreApi()
  useRehydrateStore(store)
  useEffect(() => subscribeToStorageRehydration(store), [store])
  const hydrated = useStoreHydration(store)
  return hydrated ? null : null
}

export const useAppearancePreference = () =>
  usePreferencesStore((state) => state.appearance)
export const useSetAppearancePreference = () =>
  usePreferencesStore((state) => state.setAppearance)
