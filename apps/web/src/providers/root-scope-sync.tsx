"use client"

import { useEffect } from "react"
import { useAppearancePreference } from "@repo/runtime-preferences"
import { resolveAppearance, useThemeScope } from "@repo/runtime-theme"
import { useSystemAppearance } from "@repo/adapters-theme-browser"

/**
 * Syncs root scope state from preference.
 *
 * Preference is the source of truth.
 * Root scope reacts to preference changes (one-way sync).
 *
 * For "system" preference, resolves using actual system appearance.
 * This replaces bidirectional sync, which was fragile and could cause loops.
 */
export function RootScopeSync() {
  const preference = useAppearancePreference()
  const systemAppearance = useSystemAppearance()
  const { setDarkMode } = useThemeScope()

  // Sync preference → root scope (preference is source of truth)
  // One-way sync eliminates risk of synchronization loops.
  // For "system" preference, resolve using actual system appearance.
  useEffect(() => {
    const nextDarkMode =
      resolveAppearance(preference, systemAppearance) === "dark"

    setDarkMode(nextDarkMode)
  }, [preference, systemAppearance, setDarkMode])

  return null
}
