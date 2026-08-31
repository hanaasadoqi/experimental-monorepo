"use client"

import { useId } from "react"

import { useThemeScopeStore } from "./theme-scope-context"
import { DEFAULT_THEME_PRIMARY_COLOR } from "./theme-scope-provider"

export function ThemeForm() {
  const inputId = useId()
  const primaryColor = useThemeScopeStore(
    (state) => state.overrides.primaryColor ?? DEFAULT_THEME_PRIMARY_COLOR
  )
  const setPrimaryColor = useThemeScopeStore((state) => state.setPrimaryColor)

  return (
    <div className="theme-form">
      <label htmlFor={inputId}>Primary color</label>
      <input
        id={inputId}
        type="color"
        value={primaryColor}
        onChange={(event) => {
          setPrimaryColor(event.currentTarget.value)
        }}
      />
    </div>
  )
}
