"use client"

import type { OklchColor } from "../../model/color"
import { transformOklchToLMS, transformLMStoRgb } from "../../utils"
import { Picker } from "../components/theme-form/picker"

interface PrimaryColorPickerProps {
  primary: OklchColor
  onPrimaryChange: (color: OklchColor) => void
}

export function PrimaryColorPicker({ primary, onPrimaryChange }: PrimaryColorPickerProps) {
  const displayOklch = {
    lightness: 52,
    chroma: primary.c,
    hue: primary.h,
  }

  const lms = transformOklchToLMS(displayOklch)
  const [r, g, b] = transformLMStoRgb(lms)

  const displayValue = {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }

  return (
    <Picker
      value={displayValue}
      onChange={({ h, c }) => {
        onPrimaryChange({ h, c, l: primary.l ?? 60 })
      }}
    />
  )
}
