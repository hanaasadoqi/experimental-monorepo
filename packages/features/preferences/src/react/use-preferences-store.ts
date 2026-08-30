"use client"

import { useStore } from "zustand"

import type {
  PreferencesStore,
} from "../store"

import {
  usePreferencesStoreApi,
} from "./preferences-context"

export function usePreferencesStore<T>(
  selector: (
    state: PreferencesStore
  ) => T,
): T {
  const store =
    usePreferencesStoreApi()

  return useStore(
    store,
    selector,
  )
}
