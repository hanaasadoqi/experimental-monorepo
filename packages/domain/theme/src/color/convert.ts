import { type Oklch as CuloriOklch, type Rgb as CuloriRgb, formatHex } from "culori"

import { converter } from "."
import { fitToGamut, isInSrgbGamut } from "./gamut"
import type { Oklch } from "./model"

export const toRgb = (color: CuloriOklch | CuloriRgb): CuloriRgb =>
  converter("rgb")(color) as CuloriRgb
export const toOklch = (color: CuloriOklch | CuloriRgb): Oklch => {
  const result = converter("oklch")(color) as CuloriOklch
  // Ensure result has all required properties (shouldn't be undefined from converter)
  return {
    l: result.l ?? 0,
    c: result.c ?? 0,
    h: result.h ?? 0,
  }
}
export const toHex = (color: CuloriOklch | CuloriRgb): string =>
  convertHex(color)
/**
 * Convert OKLch or RGB color to hex, ensuring it stays in sRGB gamut.
 * Accepts any input format, converts to target mode, fits to gamut, returns hex.
 */
export function convertHex(color: CuloriOklch | CuloriRgb): string {
  // Detect if input is OKLch (has l, c, h properties) or RGB (has r, g, b)
  const isInputOklch = "l" in color && "c" in color && "h" in color

  // Always work in OKLch for gamut operations (gamut functions expect Oklch)
  const oklchColor: Oklch = isInputOklch
    ? ({
      l: (color as CuloriOklch).l ?? 0,
      c: (color as CuloriOklch).c ?? 0,
      h: (color as CuloriOklch).h ?? 0,
    } as Oklch)
    : toOklch(color)

  // Verify gamut and fit if needed
  const gamutFitted = isInSrgbGamut(oklchColor)
    ? oklchColor
    : fitToGamut(oklchColor)

  // Return as hex
  const hexResult = formatHex({
    mode: "oklch" as const,
    l: gamutFitted.l,
    c: gamutFitted.c,
    h: gamutFitted.h,
  })
  return hexResult ?? "#000000"
}


function round(n: number, digits: number) {
  const factor = 10 ** digits
  return Math.round(n * factor) / factor
}

/** Serialize to a CSS `oklch()` string with lightness on the 0..1 scale. */
export function oklchToCss({ l, c, h }: Oklch): string {
  return `oklch(${round(l, 4)} ${round(c, 4)} ${round(h, 2)})`
}

export function oklchToHex({ l, c, h }: Oklch): string {
  const fitted = isInSrgbGamut({ l, c, h })
    ? { l, c, h }
    : fitToGamut({ l, c, h })
  const hex = formatHex({
    mode: "oklch" as const,
    l: fitted.l,
    c: fitted.c,
    h: fitted.h,
  })
  return hex ?? "#000000"
}

export const hexRgb = (value: string) => {
  const match = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (match) {
    const r = parseInt(match[1] ?? "0", 10)
    const g = parseInt(match[2] ?? "0", 10)
    const b = parseInt(match[3] ?? "0", 10)
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
      return { r, g, b }
    }
  }
}
export const oklchToRgb = (color: Oklch): CuloriRgb => {
  const fitted = isInSrgbGamut(color) ? color : fitToGamut(color)
  return toRgb({
    mode: "oklch" as const,
    l: fitted.l,
    c: fitted.c,
    h: fitted.h,
  } as CuloriOklch)
}
/**
 * Convert to 0-255 sRGB bytes, clamping into gamut first.
 * Used for pixel-level canvas rendering.
 */
export function oklchToRgbBytes({ l, c, h }: Oklch): [number, number, number] {
  const rgb = oklchToRgb({ l, c, h })
  const toByte = (n: number | undefined) =>
    Math.round(Math.min(1, Math.max(0, n ?? 0)) * 255)
  return [toByte(rgb?.r), toByte(rgb?.g), toByte(rgb?.b)]
}
