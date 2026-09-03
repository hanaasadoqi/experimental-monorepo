import { Oklch, Rgb, formatHex } from "culori";
import { converter } from ".";
import { fitToGamut, isInSrgbGamut } from "./gamut";

export const toRgb = (color: Oklch | Rgb): Rgb => converter("rgb")(color) as Rgb
export const toOklch = (color: Oklch | Rgb): Oklch => converter("oklch")(color) as Oklch
export const toHex = (color: Oklch | Rgb): string => convertHex(color)

export const convert = {
  toHex,
  toOklch,
  toRgb,
}
/**
 * Convert OKLch or RGB color to hex, ensuring it stays in sRGB gamut.
 * Accepts any input format, converts to target mode, fits to gamut, returns hex.
 */
export function convertHex(color: Oklch | Rgb): string {
  // Detect if input is OKLch (has l, c, h properties) or RGB (has r, g, b)
  const isInputOklch = "l" in color && "c" in color && "h" in color

  // Always work in OKLch for gamut operations (gamut functions expect Oklch)
  const oklchColor: Oklch = isInputOklch
    ? (color as Oklch)
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
export const oklchToRgb = (color: Oklch) => {
  const fitted = isInSrgbGamut(color) ? color : fitToGamut(color)
  return toRgb({
    mode: "oklch" as const,
    l: fitted.l,
    c: fitted.c,
    h: fitted.h,
  } as Oklch)
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
