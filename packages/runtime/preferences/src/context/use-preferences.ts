"use client"

import { createStoreHook } from "@repo/services-zustand/react"

import type { PreferencesActions, PreferencesStore } from "../store"

import { usePreferencesStoreApi } from "./preferences-context"
import type {
  AppearancePreference,
  DateFormatPreference,
  LanguagePreference,
  TimeFormatPreference,
} from "@repo/domain-preferences"

export const usePreferencesStore = createStoreHook<PreferencesStore>(
  usePreferencesStoreApi
)

export function useAppearancePreference(): AppearancePreference {
  return usePreferencesStore((state) => state.appearance)
}

export function useSetAppearancePreference(): PreferencesActions["setAppearance"] {
  return usePreferencesStore((state) => state.setAppearance)
}

export function useLanguagePreference(): LanguagePreference {
  return usePreferencesStore((state) => state.language)
}

export function useSetLanguagePreference(): PreferencesActions["setLanguage"] {
  return usePreferencesStore((state) => state.setLanguage)
}

export function useDateFormatPreference(): DateFormatPreference {
  return usePreferencesStore((state) => state.dateFormat)
}

export function useSetDateFormatPreference(): PreferencesActions["setDateFormat"] {
  return usePreferencesStore((state) => state.setDateFormat)
}

export function useTimeFormatPreference(): TimeFormatPreference {
  return usePreferencesStore((state) => state.timeFormat)
}

export function useSetTimeFormatPreference(): PreferencesActions["setTimeFormat"] {
  return usePreferencesStore((state) => state.setTimeFormat)
}

export function usePreferences(): PreferencesStore {
  return usePreferencesStore((state) => state)
}
