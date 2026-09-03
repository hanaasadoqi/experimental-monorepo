import { converter, formatHex } from "culori"

import { fitToGamut, isInSrgbGamut } from "./gamut"
import type { Oklch } from "./model"

const toRgb = converter("rgb")

function round(n: number, digits: number) {
  const factor = 10 ** digits
  return Math.round(n * factor) / factor
}

/** Serialize to a CSS `oklch()` string with lightness on the 0..1 scale. */
export function oklchToCss({ l, c, h }: Oklch): string {
  return `oklch(${round(l, 4)} ${round(c, 4)} ${round(h, 2)})`
}

export function oklchToHex({ l, c, h }: Oklch): string {
  const hex = formatHex({ mode: "oklch", l, c, h })
  return hex ?? "#000000"
}

/**
 * Convert to 0-255 sRGB bytes, clamping into gamut first.
 * Used for pixel-level canvas rendering.
 */
export function oklchToRgbBytes({ l, c, h }: Oklch): [number, number, number] {
  const fitted = isInSrgbGamut({ l, c, h })
    ? { l, c, h }
    : fitToGamut({ l, c, h })
  const rgb = toRgb({ mode: "oklch", l: fitted.l, c: fitted.c, h: fitted.h })
  const toByte = (n: number | undefined) =>
    Math.round(Math.min(1, Math.max(0, n ?? 0)) * 255)
  return [toByte(rgb?.r), toByte(rgb?.g), toByte(rgb?.b)]
}
