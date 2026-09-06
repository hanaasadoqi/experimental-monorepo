"use client"

import { createStoreHook } from "@repo/services-zustand/react"
import { useEffect, useState } from "react"

import type { PreferencesActions, PreferencesStore } from "../store"
import { resolveModeFromAppearancePreference } from "../lib/resolve-appearance"

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

/**
 * H5 FIX: Listen for OS appearance preference changes and return resolved mode.
 *
 * When user preference is set to "system", this hook observes OS theme changes
 * and triggers re-render when the system preference changes (light ↔ dark).
 *
 * Usage:
 * ```tsx
 * const mode = useSystemAwareAppearance() // "light" | "dark"
 * ```
 */
export function useSystemAwareAppearance(): "light" | "dark" {
  const appearance = useAppearancePreference()
  const [systemMode, setSystemMode] = useState<"light" | "dark">("light")

  useEffect(() => {
    // Only setup listener if in browser and preference is "system"
    if (typeof window === "undefined") {
      setSystemMode("light")
      return
    }

    try {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

      // Set initial value
      setSystemMode(mediaQuery.matches ? "dark" : "light")

      // Handler for preference changes
      const handleChange = (e: MediaQueryListEvent) => {
        setSystemMode(e.matches ? "dark" : "light")
      }

      // Listen for changes
      mediaQuery.addEventListener("change", handleChange)

      return () => {
        mediaQuery.removeEventListener("change", handleChange)
      }
    } catch (error) {
      console.error("Failed to setup system appearance listener:", error)
      setSystemMode("light")
    }
  }, [])

  return resolveModeFromAppearancePreference(appearance, systemMode)
}
