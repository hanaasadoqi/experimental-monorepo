"use client"

import { useAppearancePreference } from "@repo/features-preferences"
import { useSystemAppearance } from "@repo/features-theme-react"
import { resolveAppearance } from "@repo/runtime-theme"
import type { ThemeMode } from "@repo/domain-theme/appearance"

/**
 * The appearance actually being rendered: the stored preference with "system"
 * collapsed against the live OS setting.
 *
 * Composed here rather than in `@repo/features-theme-react` so that package
 * stays free of a dependency on `@repo/features-preferences` — the app is the
 * composition root that knows about both. Re-renders when the OS setting
 * changes, and is SSR-safe (`useSystemAppearance` serves "light" on the server).
 */
export function useResolvedAppearance(): ThemeMode {
  const preference = useAppearancePreference()
  const systemAppearance = useSystemAppearance()

  return resolveAppearance(preference, systemAppearance)
}
