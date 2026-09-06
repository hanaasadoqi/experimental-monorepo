"use client"

import { useEffect } from "react"
import { useAppearancePreference, useSetAppearancePreference } from "@repo/features-preferences"
import { useThemeScope } from "@repo/runtime-theme"

/**
 * Syncs preferences ↔ root scope state.
 *
 * - When preference changes via PreferencesProvider, updates root scope
 * - When root scope dark mode changes, updates preference
 *
 * This keeps both systems in sync during the migration to unified scoped-theme architecture.
 */
export function RootScopeSync() {
  const preference = useAppearancePreference()
  const setPreference = useSetAppearancePreference()
  const { isDarkModeEnabled, setDarkMode } = useThemeScope()

  // Sync preference → root scope (preference is source of truth)
  useEffect(() => {
    const nextDarkMode =
      preference === "dark" ? true : preference === "light" ? false : undefined

    if (isDarkModeEnabled !== nextDarkMode) {
      setDarkMode(nextDarkMode)
    }
  }, [preference, isDarkModeEnabled, setDarkMode])

  // Sync root scope → preference (detect independent scope changes)
  // Explicitly handles all three cases: true, false, undefined (system)
  useEffect(() => {
    const nextPreference: typeof preference =
      isDarkModeEnabled === true
        ? "dark"
        : isDarkModeEnabled === false
          ? "light"
          : "system"

    if (preference !== nextPreference) {
      setPreference(nextPreference)
    }
  }, [isDarkModeEnabled, preference, setPreference])

  return null
}
