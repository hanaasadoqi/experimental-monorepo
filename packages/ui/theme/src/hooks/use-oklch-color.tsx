"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import { toast } from "sonner"
import {
  fitToGamut,
  generateShades,
  hexColorSchema,
  isInSrgbGamut,
  type Oklch,
  oklchColorSchema,
  oklchToCss,
  oklchToHex,
  oklchToRgb,
  parseColorInput,
  parseRgbStringToOklch,
  rgbColorSchema,
  type RgbObject,
  rgbToCss,
} from "@repo/domain-theme"
import type { ZodType } from "zod"

export const DEFAULT_OKLCH_COLOR: Oklch = { l: 0.64, c: 0.14, h: 250 }

/** The three text representations a color can be edited as. */
export type ColorFormat = "hex" | "oklch" | "rgb"

export type UseOklchColorOptions = {
  /**
   * Starting color. Omit (or pass `undefined`) for a color that is not set yet
   * — an accent the user has not chosen, for example. `color` still resolves to
   * `DEFAULT_OKLCH_COLOR` so consumers always receive a renderable value;
   * `isSet` reports whether it was ever actually chosen.
   */
  initial?: Oklch
  /** Called whenever the color changes. Not called on mount. */
  onChange?: (color: Oklch) => void
}

/** One editable text representation of the current color. */
export type ColorStateResult = {
  format: ColorFormat
  /** Current field text, including any in-progress edit. */
  value: string
  setValue: Dispatch<SetStateAction<string>>
  /** Named with the `Ref` suffix so `react-hooks/immutability` permits `.current` writes. */
  focusedRef?: ReturnType<typeof useRef<boolean>>
  focused?: boolean
  /** Parse `value` and apply it, or revert the field and report the error. */
  commit: () => void
  schema: ZodType
  /** The color formatted for this field, ignoring in-progress edits. */
  canonical: string
}

export type UseOklchColorReturn = {
  /** Always defined — falls back to `DEFAULT_OKLCH_COLOR` when never set. */
  color: Oklch
  setColor: Dispatch<SetStateAction<Oklch>>
  /** Whether a color was ever explicitly provided or set. */
  isSet: boolean
  /** Return to the unset state; `color` falls back to the default. */
  clear: () => void
  inGamut: boolean
  displayColor: Oklch
  hex: string
  css: string
  rgb: RgbObject
  rgbCss: string
  shades: ReturnType<typeof generateShades>
  hexText: string
  setHexText: Dispatch<SetStateAction<string>>
  hexFocused: ReturnType<typeof useRef<boolean>>
  commitHex: () => void
  cssText: string
  setCssText: Dispatch<SetStateAction<string>>
  cssFocused: ReturnType<typeof useRef<boolean>>
  commitCss: () => void
  rgbText: string
  setRgbText: Dispatch<SetStateAction<string>>
  rgbFocused: ReturnType<typeof useRef<boolean>>
  commitRgb: () => void
  randomize: () => void
  /** Field state for one format, so a component can render any of them uniformly. */
  resolveColorState: (format: ColorFormat) => ColorStateResult
}

function isOklchColor(value: Oklch | UseOklchColorOptions): value is Oklch {
  return typeof (value as Oklch).l === "number"
}

function normalizeOptions(
  initialOrOptions?: Oklch | UseOklchColorOptions
): UseOklchColorOptions {
  if (!initialOrOptions) return {}
  return isOklchColor(initialOrOptions)
    ? { initial: initialOrOptions }
    : initialOrOptions
}

/**
 * Shared state + derived values for an OKLCH color editor: current color,
 * gamut-safe display values, synced hex/oklch()/rgb() text inputs, and the
 * generated shade ramp. Used by every picker view (full, compact, popover,
 * sheet, card, dialog, tabs) so they stay behaviorally identical.
 *
 * Accepts either a color directly or an options object:
 *
 * ```ts
 * useOklchColor()                        // unset; color is the default
 * useOklchColor(brandColor)              // set to a known color
 * useOklchColor(maybeAccent)             // undefined is fine — still resolves
 * useOklchColor({ initial, onChange })
 * ```
 *
 * Every derived value (`hex`, `css`, `rgb`, `rgbCss`, `shades`) is always
 * defined, whether or not a color was ever set.
 */
export function useOklchColor(
  initialOrOptions?: Oklch | UseOklchColorOptions
): UseOklchColorReturn {
  const { initial, onChange } = normalizeOptions(initialOrOptions)

  // `undefined` means "never set". Kept distinct from the default so callers
  // that treat a color as optional (an accent, say) can tell the two apart.
  const [storedColor, setStoredColor] = useState<Oklch | undefined>(initial)

  const color = storedColor ?? DEFAULT_OKLCH_COLOR
  const isSet = storedColor !== undefined

  const inGamut = useMemo(() => isInSrgbGamut(color), [color])
  const displayColor = useMemo(
    () => (inGamut ? color : fitToGamut(color)),
    [color, inGamut]
  )
  const hex = useMemo(() => oklchToHex(displayColor), [displayColor])
  const rgb = useMemo(() => oklchToRgb(displayColor), [displayColor])
  const rgbCss = useMemo(() => rgbToCss(rgb), [rgb])
  const css = useMemo(() => oklchToCss(color), [color])
  const shades = useMemo(() => generateShades(color), [color])

  const setColor = useCallback<Dispatch<SetStateAction<Oklch>>>((action) => {
    setStoredColor((previous) => {
      const base = previous ?? DEFAULT_OKLCH_COLOR
      return typeof action === "function" ? action(base) : action
    })
  }, [])

  const clear = useCallback(() => setStoredColor(undefined), [])

  // Held in a ref so an inline `onChange` does not re-fire the effect.
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Tracks the value already reported rather than a "has mounted" flag: refs
  // survive StrictMode's simulated remount, so a boolean flag would let the
  // second effect pass fire onChange with the mount-time color.
  const lastNotifiedRef = useRef(color)
  useEffect(() => {
    if (lastNotifiedRef.current === color) return
    lastNotifiedRef.current = color
    onChangeRef.current?.(color)
  }, [color])

  const [hexText, setHexText] = useState(hex)
  const [cssText, setCssText] = useState(css)
  const [rgbText, setRgbText] = useState(rgbCss)

  const hexFocused = useRef(false)
  const cssFocused = useRef(false)
  const rgbFocused = useRef(false)

  // Adjusting state during render (a supported React pattern): each field
  // follows the color unless the user is part-way through editing that field.
  if (!hexFocused.current && hexText !== hex) setHexText(hex)
  if (!cssFocused.current && cssText !== css) setCssText(css)
  if (!rgbFocused.current && rgbText !== rgbCss) setRgbText(rgbCss)

  function commitHex() {
    const parsed = parseColorInput(hexText)
    if (parsed) {
      setColor(parsed)
      return
    }
    setHexText(hex)
    toast.error("Not a valid hex color")
  }

  function commitCss() {
    const parsed = parseColorInput(cssText)
    if (parsed) {
      setColor(parsed)
      return
    }
    setCssText(css)
    toast.error("Not a valid oklch() value")
  }

  function commitRgb() {
    const parsed = parseRgbStringToOklch(rgbText)
    if (parsed) {
      setColor(parsed)
      return
    }
    setRgbText(rgbCss)
    toast.error("Not a valid rgb() value")
  }

  function randomize() {
    // Fitted so the button can never land on a colour that renders clamped.
    setColor(
      fitToGamut({
        l: 0.35 + Math.random() * 0.45,
        c: 0.04 + Math.random() * 0.2,
        h: Math.random() * 360,
      })
    )
  }

  function resolveColorState(format: ColorFormat): ColorStateResult {
    switch (format) {
      case "hex":
        return {
          format,
          value: hexText,
          setValue: setHexText,
          focusedRef: hexFocused,
          commit: commitHex,
          schema: hexColorSchema,
          canonical: hex,
        }
      case "rgb":
        return {
          format,
          value: rgbText,
          setValue: setRgbText,
          focusedRef: rgbFocused,
          commit: commitRgb,
          schema: rgbColorSchema,
          canonical: rgbCss,
        }
      default:
        return {
          format,
          value: cssText,
          setValue: setCssText,
          focusedRef: cssFocused,
          commit: commitCss,
          schema: oklchColorSchema,
          canonical: css,
        }
    }
  }

  return {
    color,
    setColor,
    isSet,
    clear,
    inGamut,
    displayColor,
    hex,
    css,
    rgb,
    rgbCss,
    shades,
    hexText,
    setHexText,
    hexFocused,
    commitHex,
    cssText,
    setCssText,
    cssFocused,
    commitCss,
    rgbText,
    setRgbText,
    rgbFocused,
    commitRgb,
    randomize,
    resolveColorState,
  }
}
