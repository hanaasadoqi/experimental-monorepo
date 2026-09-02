"use client"

import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { fitToGamut, generateShades, isInSrgbGamut, Oklch, oklchToCss, oklchToHex, parseColorInput } from "../../domain/core/colors/utils";


export const DEFAULT_OKLCH_COLOR: Oklch = { l: 0.64, c: 0.14, h: 250 }

/**
 * Shared state + derived values for an OKLCH color editor: current color,
 * gamut-safe display values, synced hex/oklch() text inputs, and the
 * generated shade ramp. Used by every picker view (full, compact, popover,
 * sheet, card, dialog, tabs) so they stay behaviorally identical.
 */
export function useOklchColor(initial: Oklch = DEFAULT_OKLCH_COLOR) {
  const [color, setColor] = useState<Oklch>(initial)

  const inGamut = isInSrgbGamut(color)
  const displayColor = inGamut ? color : fitToGamut(color)
  const hex = useMemo(() => oklchToHex(displayColor), [displayColor])
  const css = useMemo(() => oklchToCss(color), [color])
  const shades = useMemo(() => generateShades(color), [color])

  const [hexText, setHexText] = useState(hex)
  const [cssText, setCssText] = useState(css)
  const hexFocused = useRef(false)
  const cssFocused = useRef(false)

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
  }
}

export type UseOklchColorReturn = ReturnType<typeof useOklchColor>
