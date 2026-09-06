import { type Rgb } from "culori"

import { clampL, clampC, clampH } from "./colors"
import type { Oklch } from "./colors"

export type CssColorMode = "oklch" | "rgb" | "hex"

/* -------------------------------------------------------------------------- */
/* Normalization & Validation                                                */
/* -------------------------------------------------------------------------- */

/**
 * Normalize OKLch values to valid ranges.
 * - Lightness: clamp to [0, 1]
 * - Chroma: clamp to [0, MAX_CHROMA]
 * - Hue: wrap to [0, 360) degrees
 */
export function normalizeOklch({
  l,
  c,
  h,
  alpha,
}: Oklch & { alpha?: number }): Oklch & { alpha?: number } {
  return {
    l: clampL(l),
    c: clampC(c),
    h: clampH(h),
    ...(alpha !== undefined && { alpha: Math.max(0, Math.min(1, alpha)) }),
  }
}

/**
 * Normalize RGB values from 0-255 byte range to 0-1 normalized range.
 * Used when input comes from CSS rgb(255, 128, 0) format.
 */
export function normalizeRgbBytes(rgb: {
  r: number
  g: number
  b: number
  alpha?: number
}): Rgb {
  const normalize = (v: number) => Math.max(0, Math.min(1, v / 255))
  return {
    r: normalize(rgb.r),
    g: normalize(rgb.g),
    b: normalize(rgb.b),
    ...(rgb.alpha !== undefined && {
      alpha: Math.max(0, Math.min(1, rgb.alpha)),
    }),
  } as Rgb
}

/**
 * Denormalize RGB values from 0-1 range to 0-255 byte range.
 * Used when outputting to CSS rgb(255, 128, 0) format or for display.
 */
export function denormalizeRgbBytes(rgb: Rgb & { alpha?: number }): {
  r: number
  g: number
  b: number
  alpha?: number
} {
  const denormalize = (v: number | undefined) =>
    Math.round(Math.max(0, Math.min(1, v ?? 0)) * 255)
  return {
    r: denormalize(rgb.r),
    g: denormalize(rgb.g),
    b: denormalize(rgb.b),
    ...(rgb.alpha !== undefined && {
      alpha: Math.max(0, Math.min(1, rgb.alpha)),
    }),
  }
}

/**
 * Normalize hex string to 6-character uppercase format (#rrggbb).
 * Handles 3-char (#abc), 6-char (#abcdef), and 8-char (#abcdef00) formats.
 */
export function normalizeHex(hexString: string): string {
  const cleaned = hexString.replace(/^#/, "").toUpperCase()

  // 3-char format: #abc → #aabbcc
  if (cleaned.length === 3) {
    return (
      "#" +
      cleaned
        .split("")
        .map((c) => c + c)
        .join("")
    )
  }

  // 6-char format: valid
  if (cleaned.length === 6 && /^[0-9A-F]{6}$/.test(cleaned)) {
    return "#" + cleaned
  }

  // 8-char format: strip alpha, keep only RGB
  if (cleaned.length === 8 && /^[0-9A-F]{8}$/.test(cleaned)) {
    return "#" + cleaned.slice(0, 6)
  }

  // Invalid format, return placeholder
  return "#000000"
}
