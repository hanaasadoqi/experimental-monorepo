"use client"

import { useMemo, useRef, useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import { toast } from "sonner"
import {
  fitToGamut,
  generateShades,
  isInSrgbGamut,
  Oklch,
  oklchToCss,
  oklchToHex,
  oklchToRgb,
  parseColorInput,
  convert
} from "@repo/domain-theme/colors"


export const DEFAULT_OKLCH_COLOR = { l: 0.64, c: 0.14, h: 250 }
export type OklchNoMode = Omit<Oklch, "mode">
/**
 * Shared state + derived values for an OKLCH color editor: current color,
 * gamut-safe display values, synced hex/oklch() text inputs, and the
 * generated shade ramp. Used by every picker view (full, compact, popover,
 * sheet, card, dialog, tabs) so they stay behaviorally identical.
 */
export function useOklchColor(initial: OklchNoMode = DEFAULT_OKLCH_COLOR): {
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
  rgb: ReturnType<typeof oklchToRgb>
  oklch: Oklch
  rgbFocused: ReturnType<typeof useRef<boolean>>
  rgbText: string
  setRgbText: Dispatch<SetStateAction<string>>
  commitRgb: () => void
} {
  const [color, setColor] = useState(initial)

  const inGamut = isInSrgbGamut(color)
  const displayColor = inGamut ? color : fitToGamut(color)
  const hex = useMemo(() => convert.toHex(displayColor), [displayColor])
  const rgb = useMemo(() => convert.toRgb(displayColor), [displayColor])
  const oklch = useMemo(() => convert.toOklch(displayColor), [displayColor])
  const css = useMemo(() => oklchToCss(color), [color])
  const shades = useMemo(() => generateShades(color), [color])

  const [hexText, setHexText] = useState(hex)
  const [cssText, setCssText] = useState(css)
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
    oklch,
    hex,
    rgbFocused,
    rgbText: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    setRgbText: (value) => {
      const match = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (match) {
        const r = parseInt(match[1], 10)
        const g = parseInt(match[2], 10)
        const b = parseInt(match[3], 10)
        if (
          !isNaN(r) &&
          !isNaN(g) &&
          !isNaN(b) &&
          r >= 0 &&
          r <= 255 &&
          g >= 0 &&
          g <= 255 &&
          b >= 0 &&
          b <= 255
        ) {
          const newColor = convert.toOklch({ r, g, b })
          setColor(newColor)
        }
      }
    }
  }
}

export type UseOklchColorReturn = ReturnType<typeof useOklchColor>
