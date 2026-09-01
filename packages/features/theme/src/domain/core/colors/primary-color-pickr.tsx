"use client"

// import { P } from "../../../react/providers/index"
import { OklchColor } from "./model"
import { transformLMStoRgb, transformOklchToLMS } from "./transforms"

interface PrimaryColorPickerProps {
  primary: OklchColor
  onPrimaryChange: (color: OklchColor) => void
}

export function PrimaryColorPicker({
  primary,
  onPrimaryChange: _,
}: PrimaryColorPickerProps) {
  const displayOklch = {
    lightness: 52,
    chroma: primary.c,
    hue: primary.h,
  }

  const lms = transformOklchToLMS(displayOklch)
  const [r, g, b] = transformLMStoRgb(lms)

  const _displayValue = {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }

  return (
    // <Picker
    //   value={displayValue}
    //   onChange={({ h, c }: { h: number; c: number }) => {
    //     onPrimaryChange({ h, c, l: primary.l ?? 60 })
    //   }}
    // />
    <></>
  )
}
