"use client"

import type { AppearancePreference } from "../model"

import { usePreferencesStore } from "./use-preferences-store"

export function useAppearancePreference(): AppearancePreference {
  return usePreferencesStore((state) => state.appearance)
}
