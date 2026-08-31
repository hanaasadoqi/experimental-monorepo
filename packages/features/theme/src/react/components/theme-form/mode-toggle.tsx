"use client"

import { type AppearancePreference } from "@repo/features-preferences"
import { Toggle } from "@repo/ui-components/base/toggle"

export interface ModeToggleProps {
  mode: AppearancePreference
  setMode: (pref: AppearancePreference) => void
}

export function ModeToggle({ mode, setMode }: ModeToggleProps) {
  return (
    <Toggle
      size="sm"
      pressed={mode === "dark"}
      onPressedChange={(pressed: boolean) => {
        setMode(pressed ? "dark" : "light")
      }}
      aria-label="Toggle theme mode between light and dark"
    >
      {mode === "dark" ? "🌙" : "☀️"}
    </Toggle>
  )
}

export default ModeToggle
