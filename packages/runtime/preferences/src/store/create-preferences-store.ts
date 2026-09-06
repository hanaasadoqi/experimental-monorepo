import { type StoreApi, createStore } from "zustand/vanilla"
import { createPersistedStore } from "@repo/services-zustand/persist"

import {
  DEFAULT_PREFERENCES,
  LanguagePreference,
  preferencesSchema,
  type AppearancePreference,
  type Preferences,
} from "@repo/domain-preferences"

import type { PreferencesStore } from "./types"
import {
  DateFormatPreference,
  TimeFormatPreference,
} from "@repo/domain-preferences/date-time"

export interface CreatePreferencesStoreOptions {
  initialState?: Partial<Preferences>
  // M6 FIX: Allow disabling persistence for tests or multiple isolated instances
  enablePersistence?: boolean
}

export type PreferencesStoreApi = StoreApi<PreferencesStore>

export function createPreferencesStore({
  initialState,
  enablePersistence = true,
}: CreatePreferencesStoreOptions = {}): PreferencesStoreApi {
  const initialPreferences: Preferences = {
    ...DEFAULT_PREFERENCES,
    ...(initialState ?? {}),
  }

  // Validate structure with schema to ensure type safety
  const validationResult = preferencesSchema.safeParse(initialPreferences)
  if (!validationResult.success) {
    const errorDetails = JSON.stringify(validationResult.error.issues, null, 2)
    console.error("Preferences validation failed:", errorDetails)
    throw new Error("Invalid preferences structure. Using defaults instead.")
  }

  if (enablePersistence) {
    return createPersistedStore<PreferencesStore>(
      (set: (state: Partial<PreferencesStore>) => void) => ({
        ...initialPreferences,

        setAppearance: (appearance: AppearancePreference) => {
          const result =
            preferencesSchema.shape.appearance.safeParse(appearance)
          if (!result.success) {
            console.error("Invalid appearance value:", appearance, result.error)
            return
          }
          set({ appearance: result.data })
        },

        setLanguage: (language: LanguagePreference) => {
          const result = preferencesSchema.shape.language.safeParse(language)
          if (!result.success) {
            console.error("Invalid language value:", language, result.error)
            return
          }
          set({ language: result.data })
        },

        setDateFormat: (dateFormat: DateFormatPreference) => {
          const result =
            preferencesSchema.shape.dateFormat.safeParse(dateFormat)
          if (!result.success) {
            console.error("Invalid dateFormat value:", dateFormat, result.error)
            return
          }
          set({ dateFormat: result.data })
        },

        setTimeFormat: (timeFormat: TimeFormatPreference) => {
          const result =
            preferencesSchema.shape.timeFormat.safeParse(timeFormat)
          if (!result.success) {
            console.error("Invalid timeFormat value:", timeFormat, result.error)
            return
          }
          set({ timeFormat: result.data })
        },
      }),
      (state: unknown) => preferencesSchema.safeParse(state),
      {
        name: "preferences-store",
        version: 1,
      }
    )
  }

  // Non-persisted store for tests or isolated instances
  return createStore<PreferencesStore>((set) => ({
    ...initialPreferences,

    setAppearance: (appearance: AppearancePreference) => {
      const result = preferencesSchema.shape.appearance.safeParse(appearance)
      if (!result.success) {
        console.error("Invalid appearance value:", appearance, result.error)
        return
      }
      set({ appearance: result.data })
    },

    setLanguage: (language: LanguagePreference) => {
      const result = preferencesSchema.shape.language.safeParse(language)
      if (!result.success) {
        console.error("Invalid language value:", language, result.error)
        return
      }
      set({ language: result.data })
    },

    setDateFormat: (dateFormat: DateFormatPreference) => {
      const result = preferencesSchema.shape.dateFormat.safeParse(dateFormat)
      if (!result.success) {
        console.error("Invalid dateFormat value:", dateFormat, result.error)
        return
      }
      set({ dateFormat: result.data })
    },

    setTimeFormat: (timeFormat: TimeFormatPreference) => {
      const result = preferencesSchema.shape.timeFormat.safeParse(timeFormat)
      if (!result.success) {
        console.error("Invalid timeFormat value:", timeFormat, result.error)
        return
      }
      set({ timeFormat: result.data })
    },
  }))
}
