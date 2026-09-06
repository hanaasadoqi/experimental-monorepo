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

  // Sync preference → root scope
  useEffect(() => {
    const nextDarkMode =
      preference === "dark" ? true : preference === "light" ? false : undefined

    // Only update if different to avoid unnecessary updates
    if (isDarkModeEnabled !== nextDarkMode) {
      setDarkMode(nextDarkMode)
    }
  }, [preference, isDarkModeEnabled, setDarkMode])

  // Sync root scope → preference (when scope changes independently)
  // This handles cases where scope state is restored from storage
  // but preference hasn't been updated yet
  useEffect(() => {
    if (isDarkModeEnabled === undefined) return

    const nextPreference: typeof preference =
      isDarkModeEnabled === true ? "dark" : "light"

    if (preference !== nextPreference) {
      setPreference(nextPreference)
    }
  }, [isDarkModeEnabled, preference, setPreference])

  return null
}
