"use client"

import type {
  PreferencesActions,
} from "../model"

import {
  usePreferencesStore,
} from "./use-preferences-store"

export function useSetAppearancePreference():
  PreferencesActions["setAppearance"] {
  return usePreferencesStore(
    (state) => state.setAppearance,
  )
}
