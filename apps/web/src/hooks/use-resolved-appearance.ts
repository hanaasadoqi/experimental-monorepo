"use client"

import { useSystemAppearance } from "@repo/adapters-theme-browser"
import { useAppearancePreference } from "@repo/runtime-preferences"
import { resolveAppearance } from "@repo/runtime-theme"
import type { ResolvedAppearancePreference } from "@repo/domain-preferences"

/**
 * The appearance actually being rendered: the stored preference with "system"
 * collapsed against the live OS setting.
 *
 * Composed here in the app so that we can depend on both @repo/features-preferences
 * and system detection. Re-renders when the OS setting changes, and is SSR-safe
 * (serves "light" on the server before hydration).
 */
export function useResolvedAppearance(): ResolvedAppearancePreference {
  const preference = useAppearancePreference()
  const systemAppearance = useSystemAppearance()

  return resolveAppearance(preference, systemAppearance)
}
