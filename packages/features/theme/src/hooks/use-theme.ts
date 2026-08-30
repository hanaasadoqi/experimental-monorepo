"use client"

import {
  useAppearancePreference,
  useSetAppearancePreference,
} from "./use-appearance"
import type { AppearancePreference } from "../types"

/**
 * Backward-compatibility shim that forwards to the canonical Appearance API.
 *
 * Returns `{ preference, setTheme }` so existing call sites keep working; the
 * canonical hooks expose the same values under their own names, plus
 * `resolvedColorScheme`, which this shim cannot reach.
 *
 * @deprecated Use `useAppearance()` — or the narrower
 * `useAppearancePreference()` / `useSetAppearancePreference()` selectors — from
 * `@repo/feature-theme`. Scheduled for removal in v2.0.
 *
 * @example
 * ```ts
 * // Before (deprecated)
 * const { preference, setTheme } = useTheme()
 *
 * // After (canonical)
 * const { preference, setPreference } = useAppearance()
 * ```
 */
export function useTheme(): {
  preference: AppearancePreference
  setTheme: (preference: AppearancePreference) => void
} {
  const preference = useAppearancePreference()
  const setPreference = useSetAppearancePreference()

  return {
    preference,
    setTheme: setPreference,
  }
}
