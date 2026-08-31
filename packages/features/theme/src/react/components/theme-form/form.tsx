"use client"

import { useState } from "react"
import type { AppearancePreference } from "@repo/features-preferences"
import type { OklchColor } from "../../../domain/core/colors/model"
import { FontSelect } from "./font-select"
import AppearanceToggle from "./mode-toggle"
import { PrimaryColorPicker } from "../../../domain/core/colors/primary-color-pickr"

interface ThemeFormState {
  appearance: AppearancePreference
  primaryColor: OklchColor
  bodyFont: string
  headingFont: string
  monoFont: string
}

const ThemeDebug = ({ state }: { state: ThemeFormState }) => {
  return (
    <pre
      style={{
        background: "#111",
        color: "#0f0",
        padding: 12,
        fontSize: 12,
        borderRadius: 6,
        overflow: "auto",
      }}
    >
      {JSON.stringify(state, null, 2)}
    </pre>
  )
}

export function ThemeForm() {
  const [state, setState] = useState<ThemeFormState>({
    appearance: "light",
    primaryColor: { h: 0, c: 0.1, l: 60 },
    bodyFont: "Inter",
    headingFont: "Inter",
    monoFont: "Inter",
  })

  const handleAppearanceChange = (appearance: AppearancePreference) => {
    setState((prev) => ({ ...prev, appearance }))
  }

  const handlePrimaryColorChange = (color: OklchColor) => {
    setState((prev) => ({ ...prev, primaryColor: color }))
  }

  const handleBodyFontChange = (font: string) => {
    setState((prev) => ({ ...prev, bodyFont: font }))
  }

  const handleHeadingFontChange = (font: string) => {
    setState((prev) => ({ ...prev, headingFont: font }))
  }

  const handleMonoFontChange = (font: string) => {
    setState((prev) => ({ ...prev, monoFont: font }))
  }

  return (
    <div className="size-full padding-16 box-border border-right border-color-surface-200">
      <div className="my-8">
        <ThemeDebug state={state} />
      </div>
      <div style={{ display: "grid", gap: 16 }}>
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1">
            <PrimaryColorPicker
              primary={state.primaryColor}
              onPrimaryChange={handlePrimaryColorChange}
            />
          </div>
          <AppearanceToggle appearance={state.appearance} setAppearance={handleAppearanceChange} />
        </div>
        <FontSelect
          type="body"
          font={state.bodyFont}
          onFontChange={handleBodyFontChange}
        />
        <FontSelect
          type="heading"
          font={state.headingFont}
          onFontChange={handleHeadingFontChange}
        />
        <FontSelect
          type="mono"
          font={state.monoFont}
          onFontChange={handleMonoFontChange}
        />
      </div>
    </div>
  )
}
