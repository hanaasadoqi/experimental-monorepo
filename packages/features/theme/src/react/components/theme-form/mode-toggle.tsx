"use client"

import { type AppearancePreference } from "@repo/features-preferences"
import { Toggle } from "@repo/ui-components/base/toggle"

export interface AppearanceToggleProps {
  appearance: AppearancePreference
  setAppearance: (pref: AppearancePreference) => void
}

export function AppearanceToggle({ appearance, setAppearance }: AppearanceToggleProps) {
  return (
    <Toggle
      size="sm"
      pressed={appearance === "dark"}
      onPressedChange={(pressed: boolean) => {
        setAppearance(pressed ? "dark" : "light")
      }}
      aria-label="Toggle theme appearance between light and dark"
    >
      {appearance === "dark" ? "🌙" : "☀️"}
    </Toggle>
  )
}

export default AppearanceToggle
