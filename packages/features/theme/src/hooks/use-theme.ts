"use client"

import {
  useAppearancePreference,
  useSetAppearancePreference,
} from "./use-appearance"
import type { AppearancePreference } from "../types"

/**
 * Legacy compatibility hook — delegates to useAppearance.
 * Use useAppearance, useAppearancePreference, etc. in new code.
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
