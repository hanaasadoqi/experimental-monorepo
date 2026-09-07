/**
 * Theme Switcher Component
 *
 * Allows users to select from available themes via the theme registry.
 * Triggers recompilation and persistence when selection changes.
 */

"use client"

import { useThemeRegistry } from "@repo/runtime-theme"

export function ThemeSwitcher() {
  const registry = useThemeRegistry()
  const themes = registry.listThemes()

  if (themes.length === 0) {
    return <div>No themes available</div>
  }

  return (
    <select
      value={registry.selectedThemeId}
      onChange={(e) => registry.selectTheme(e.target.value)}
      className="rounded border px-3 py-2"
    >
      {themes.map((theme) => (
        <option key={theme.metadata.name} value={theme.metadata.name}>
          {theme.metadata.name}
        </option>
      ))}
    </select>
  )
}
