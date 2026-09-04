import { type Rgb } from "culori"

import { clampL, clampC, clampH } from "./gamut"
import { type OklchColor, type OklchObject, DEFAULT_HEX } from "./model"

/* -------------------------------------------------------------------------- */
/* Normalization                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Normalize OKLCH values to valid ranges.
 * - Lightness: clamp to [0, 1]
 * - Chroma: clamp to [0, MAX_CHROMA]
 * - Hue: wrap to [0, 360) degrees
 *
 * Accepts partial OklchColor (with l, c, h fields) and returns complete OklchColor.
 */
export function normalizeOklch(
  color: Partial<OklchColor> | Partial<OklchObject>
): OklchColor {
  // Handle both OklchColor ({l, c, h}) and OklchComponents ({lightness, chroma, hue})
  const l =
    ("l" in color
      ? color.l
      : "lightness" in color
        ? color.lightness
        : undefined) ?? 0
  const c =
    ("c" in color ? color.c : "chroma" in color ? color.chroma : undefined) ?? 0

  // `h` (OklchColor) is already degrees; `hue` (OklchComponents) is radians
  // per its documented contract and must be converted before clampH wraps
  // it, since clampH's modulo assumes a 0..360 *degree* domain.
  const h =
    "h" in color && color.h !== undefined
      ? color.h
      : "hue" in color && color.hue !== undefined
        ? (color.hue * 180) / Math.PI
        : 0
  const a = "a" in color ? color.a : undefined

  return {
    l: clampL(l),
    c: clampC(c),
    h: clampH(h),
    ...(a !== undefined && { a: Math.max(0, Math.min(1, a)) }),
  } as OklchColor
}

/**
 * Normalize RGB values from 0-255 byte range to 0-1 normalized range.
 * Used when input comes from CSS rgb(255, 128, 0) format.
 */
export function normalizeRgbBytes(rgb: {
  r: number
  g: number
  b: number
  a?: number
}): Rgb {
  const normalize = (v: number) => Math.max(0, Math.min(1, v / 255))
  return {
    mode: "rgb",
    r: normalize(rgb.r),
    g: normalize(rgb.g),
    b: normalize(rgb.b),
    // culori's Rgb names its alpha channel `alpha`, not this package's `a` —
    // the declared `Rgb` return type requires it (finding #1, alpha mapping).
    ...(rgb.a !== undefined && { alpha: Math.max(0, Math.min(1, rgb.a)) }),
  }
}

/**
 * Denormalize RGB values from 0-1 range to 0-255 byte range.
 * Used when outputting to CSS rgb(255, 128, 0) format or for display.
 */
export function denormalizeRgbBytes(rgb: Rgb & { a?: number }): {
  r: number
  g: number
  b: number
  a?: number
} {
  const denormalize = (v: number | undefined) =>
    Math.round(Math.max(0, Math.min(1, v ?? 0)) * 255)
  return {
    r: denormalize(rgb.r),
    g: denormalize(rgb.g),
    b: denormalize(rgb.b),
    ...(rgb.a !== undefined && { a: Math.max(0, Math.min(1, rgb.a)) }),
  }
}

/**
 * Requires the exact grammar `isValidHex`/`hexStrSchema` accept: `#` + 3 or 6
 * hex digits. Previously accepted unprefixed and 8-digit (alpha) input that
 * those validators rejected — a value could be "normalized" here without
 * ever being valid per the schema (finding #4d).
 */
export function normalizeHex(hexString: string): string {
  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hexString)) {
    return DEFAULT_HEX
  }

  const cleaned = hexString.slice(1).toUpperCase()

  // 3-char format: #abc → #aabbcc
  if (cleaned.length === 3) {
    const expanded =
      (cleaned[0] ?? "0") +
      (cleaned[0] ?? "0") +
      cleaned[1] +
      cleaned[1] +
      cleaned[2] +
      cleaned[2]
    return "#" + expanded
  }

  return "#" + cleaned
}
