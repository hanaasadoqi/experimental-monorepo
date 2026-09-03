"use client"

import { useMemo, useRef, useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import { toast } from "sonner"
import {
  fitToGamut,
  generateShades,
  isInSrgbGamut,
  type Oklch,
  oklchToCss,
  oklchToHex,
  oklchToRgb,
  parseColorInput,
  parseRgbStringToOklch,
} from "@repo/domain-theme"

export const DEFAULT_OKLCH_COLOR = { l: 0.64, c: 0.14, h: 250 }

export type UseOklchColorOptions = {
  initial?: Oklch
  onChange?: (color: Oklch) => void
}

export type UseOklchColorReturn = {
  color: Oklch
  setColor: Dispatch<SetStateAction<Oklch>>
  inGamut: boolean
  displayColor: Oklch
  hex: string
  css: string
  shades: ReturnType<typeof generateShades>
  hexText: string
  setHexText: Dispatch<SetStateAction<string>>
  hexFocused: ReturnType<typeof useRef<boolean>>
  commitHex: () => void
  cssText: string
  setCssText: Dispatch<SetStateAction<string>>
  cssFocused: ReturnType<typeof useRef<boolean>>
  commitCss: () => void
  randomize: () => void
  rgb: ReturnType<typeof oklchToRgb> | undefined
  rgbFocused: ReturnType<typeof useRef<boolean>>
  rgbText: string
  setRgbText: Dispatch<SetStateAction<string>>
  commitRgb: () => void
}

/**
 * Shared state + derived values for an OKLCH color editor: current color,
 * gamut-safe display values, synced hex/oklch() text inputs, and the
 * generated shade ramp. Used by every picker view (full, compact, popover,
 * sheet, card, dialog, tabs) so they stay behaviorally identical.
 */
export function useOklchColor(
  initial: Oklch = DEFAULT_OKLCH_COLOR
): UseOklchColorReturn {
  const [color, setColor] = useState(initial)

  const inGamut = isInSrgbGamut(color)
  const displayColor = inGamut ? color : fitToGamut(color)
  const hex = useMemo(() => oklchToHex(displayColor), [displayColor])
  const rgb = useMemo(() => oklchToRgb(displayColor), [displayColor])
  const css = useMemo(() => oklchToCss(color), [color])
  const shades = useMemo(() => generateShades(color), [color])

  const [hexText, setHexText] = useState(hex)
  const [cssText, setCssText] = useState(css)
  const [rgbText, setRgbText] = useState(() => {
    if (!rgb) return "rgb(0, 0, 0)"
    const r = Math.round(rgb.r * 255)
    const g = Math.round(rgb.g * 255)
    const b = Math.round(rgb.b * 255)
    return `rgb(${r}, ${g}, ${b})`
  })

  const hexFocused = useRef(false)
  const cssFocused = useRef(false)
  const rgbFocused = useRef(false)

  if (!hexFocused.current && hexText !== hex) setHexText(hex)
  if (!cssFocused.current && cssText !== css) setCssText(css)

  function commitHex() {
    const parsed = parseColorInput(hexText)
    if (parsed) {
      setColor(parsed)
    } else {
      setHexText(hex)
      toast.error("Not a valid hex color")
    }
  }

  function commitCss() {
    const parsed = parseColorInput(cssText)
    if (parsed) {
      setColor(parsed)
    } else {
      setCssText(css)
      toast.error("Not a valid oklch() value")
    }
  }

  function commitRgb() {
    const parsed = parseRgbStringToOklch(rgbText)
    if (parsed) {
      setColor(parsed)
    } else {
      if (rgb) {
        const r = Math.round(rgb.r * 255)
        const g = Math.round(rgb.g * 255)
        const b = Math.round(rgb.b * 255)
        setRgbText(`rgb(${r}, ${g}, ${b})`)
      }
      toast.error("Not a valid rgb() value")
    }
  }

  function randomize() {
    setColor({
      l: 0.35 + Math.random() * 0.45,
      c: 0.04 + Math.random() * 0.2,
      h: Math.random() * 360,
    })
  }

  return {
    color,
    setColor,
    inGamut,
    displayColor,
    hex,
    css,
    shades,
    hexText,
    setHexText,
    hexFocused,
    commitHex,
    cssText,
    setCssText,
    cssFocused,
    commitCss,
    randomize,
    rgb,
    rgbFocused,
    rgbText,
    setRgbText,
    commitRgb,
  }
}
