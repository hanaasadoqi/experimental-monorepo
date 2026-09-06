/**
 * PARSE LAYER
 *
 * All parsing functions:
 * 1. Take strings or mixed input
 * 2. Validate using Zod schemas
 * 3. Return OBJECT forms only (never strings)
 * 4. Return null on parse failure
 *
 * RULE: Always normalize/clamp output before returning.
 */

import {
  MAX_CHROMA,
  MAX_LIGHTNESS,
  MIN_CHROMA,
  MIN_LIGHTNESS,
  NUMERIC_TOKEN_REGEX,
  OKLCH_REGEX,
} from "../constants"
import { toOklch } from "./convert"
import { clampC, clampH, clampL } from "./gamut"
import { OklchColor, OklchComponents } from "./core-model"
import { normalizeRgbBytes } from "./normalize"
import { isValidHex } from "./validate"

/* -------------------------------------------------------------------------- */
/* OKLCH: string → OklchColor (degrees, safe to index)                         */
/* -------------------------------------------------------------------------- */

/**
 * Parse CSS oklch() string to OKLCH color object (degrees form).
 *
 * Input: "oklch(50% 0.15 120)"
 * Output: { l: 0.5, c: 0.15, h: 120 }
 *
 * @param value - CSS oklch() string
 * @returns OklchColor if valid, null otherwise
 */
export function parseOklchString(value: string): OklchColor | null {
  const match = value.match(OKLCH_REGEX)
  if (!match) return null

  try {
    const l = Number(match[1]) / (match[2] ? 100 : 1)
    const c = Number(match[3])
    const h = Number(match[4])

    // OKLCH_REGEX's [\d.]+ groups accept malformed multi-dot text like
    // "1.2.3" (Number() on that is NaN); reject non-finite values explicitly
    // rather than let them pass the range check below (NaN fails every
    // comparison, so `l < MIN_LIGHTNESS` etc. would silently be false).
    if (![l, c, h].every(Number.isFinite)) return null

    // Validate ranges (hue is allowed to be outside 0-360 before wrapping)
    if (
      l < MIN_LIGHTNESS ||
      l > MAX_LIGHTNESS ||
      c < MIN_CHROMA ||
      c > MAX_CHROMA
    ) {
      return null
    }

    return { l: clampL(l), c: clampC(c), h: clampH(h) }
  } catch {
    return null
  }
}

/**
 * Strictly parse oklch() string, throwing on invalid.
 * Use this when parse failure should be an error.
 */
export function assertOklchString(value: string): OklchColor {
  const parsed = parseOklchString(value)
  if (!parsed) {
    throw new Error(
      `Invalid OKLch string: "${value}". Expected: oklch(L% C H) or oklch(L C H)`
    )
  }
  return parsed
}

/**
 * Parse CSS oklch() string to computation form (radians for hue).
 * Used internally for transformations.
 *
 * Output: { lightness: 0.5, chroma: 0.15, hue: 2.094 (radians) }
 *
 * Note: preserves original hue degrees (including 360) before converting to radians,
 * so 360 degrees becomes 2π radians, not 0.
 */
export function parseOklchStringToComponents(
  value: string
): OklchComponents | null {
  const match = value.match(OKLCH_REGEX)
  if (!match) return null

  try {
    const l = Number(match[1]) / (match[2] ? 100 : 1)
    const c = Number(match[3])
    const h = Number(match[4])

    if (![l, c, h].every(Number.isFinite)) return null

    // Validate ranges (skip MIN/MAX_HUE check to allow 360 degrees)
    if (
      l < MIN_LIGHTNESS ||
      l > MAX_LIGHTNESS ||
      c < MIN_CHROMA ||
      c > MAX_CHROMA
    ) {
      return null
    }

    return {
      lightness: clampL(l),
      chroma: clampC(c),
      hue: (h * Math.PI) / 180, // Convert degrees to radians directly, preserving original value
    }
  } catch {
    return null
  }
}

/* -------------------------------------------------------------------------- */
/* HEX: string → OklchColor (via RGB conversion)                               */
/* -------------------------------------------------------------------------- */

/**
 * Parse hex (#rgb or #rrggbb) to OKLCH.
 */
export function parseHexToOklch(hex: string): OklchColor | null {
  if (!isValidHex(hex)) return null

  try {
    // Delegate to the ./convert adapter, which culori parses hex strings
    // through natively (no object mode-tagging needed for string input).
    return toOklch(hex.trim().toLowerCase())
  } catch {
    return null
  }
}

/* -------------------------------------------------------------------------- */
/* RGB: CSS string → OklchColor (via conversion)                               */
/* -------------------------------------------------------------------------- */

/**
 * Parse CSS rgb(r, g, b) or rgba(r, g, b, a) to OKLCH.
 * Input is expected in 0-255 range (CSS standard).
 */
export function parseRgbStringToOklch(rgbString: string): OklchColor | null {
  // Anchored to the full string (unlike a bare .match of this pattern) so
  // trailing/leading garbage around an otherwise-valid rgb()/rgba() call is
  // rejected instead of silently ignored. Matches the grammar `rgbStrSchema`
  // in model.ts already enforces.
  const match = rgbString
    .trim()
    .match(
      /^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/i
    )
  if (!match) return null

  try {
    const r = parseInt(match[1] ?? "0", 10)
    const g = parseInt(match[2] ?? "0", 10)
    const b = parseInt(match[3] ?? "0", 10)
    const a = match[4] ? parseFloat(match[4]) : undefined

    if (
      r < 0 ||
      r > 255 ||
      g < 0 ||
      g > 255 ||
      b < 0 ||
      b > 255 ||
      (a !== undefined && (a < 0 || a > 1))
    ) {
      return null
    }

    // Delegate to the adapter in ./convert, which already handles culori's
    // mode discriminator and alpha (`alpha` vs this package's `a`) mapping.
    const normalized = normalizeRgbBytes({ r, g, b, alpha: a })
    return toOklch({
      r: normalized.r,
      g: normalized.g,
      b: normalized.b,
      ...(normalized.alpha !== undefined && { a: normalized.alpha }),
    })
  } catch {
    return null
  }
}

/* -------------------------------------------------------------------------- */
/* UNIFIED: lenient color input → OklchColor (degrees)                         */
/* -------------------------------------------------------------------------- */

/**
 * Parse any color format (hex, oklch(), rgb(), or bare triplet) to OklchColor.
 * Deliberately lenient and clamps out-of-range values.
 *
 * Accepts:
 *   - "#3366ff" (hex)
 *   - "oklch(50% 0.15 120)" (CSS oklch)
 *   - "rgb(100, 150, 200)" (CSS rgb)
 *   - "0.5 0.15 120" (bare triplet)
 */
export function parseColorInput(input: string): OklchColor | null {
  const raw = input.trim()
  if (!raw) return null

  // Try hex
  if (raw.startsWith("#")) {
    const hex = parseHexToOklch(raw)
    if (hex) return hex
  }

  // Try oklch()
  if (raw.startsWith("oklch")) {
    const oklch = parseOklchString(raw)
    if (oklch) return oklch
  }

  // Try rgb()
  if (raw.startsWith("rgb")) {
    const rgb = parseRgbStringToOklch(raw)
    if (rgb) return rgb
  }

  // Try bare triplet: "0.5 0.15 120"
  const parts = raw.replace(/[,/]/g, " ").split(/\s+/).filter(Boolean)

  // Exactly 3 tokens — a trailing/leading extra token used to be silently
  // ignored by `>= 3`. Each token must be a clean number (optionally with a
  // trailing `%`); `NUMERIC_TOKEN_REGEX` rejects malformed multi-dot text
  // like "30.2.3" that `Number.parseFloat` would otherwise prefix-parse to
  // `30.2` instead of rejecting outright.
  if (parts.length === 3 && parts.every((p) => NUMERIC_TOKEN_REGEX.test(p))) {
    try {
      const lRaw = parts[0]
      const cRaw = parts[1]
      const hRaw = parts[2]

      const l = lRaw?.endsWith("%")
        ? Number.parseFloat(lRaw) / 100
        : Number.parseFloat(String(lRaw))
      const c = cRaw?.endsWith("%")
        ? (Number.parseFloat(cRaw) / 100) * MAX_CHROMA
        : Number.parseFloat(String(cRaw))
      const h = Number.parseFloat(String(hRaw))

      if (![l, c, h].every(Number.isFinite)) return null

      return {
        l: clampL(l),
        c: clampC(c),
        h: clampH(h),
      }
    } catch {
      return null
    }
  }

  return null
}

/**
 * Strictly parse any color input, throwing on failure.
 */
export function assertColorInput(input: string): OklchColor {
  const parsed = parseColorInput(input)
  if (!parsed) {
    throw new Error(
      `Invalid color input: "${input}". Expected: hex, oklch(), rgb(), or triplet`
    )
  }
  return parsed
}

/* -------------------------------------------------------------------------- */
/* EXPORTS: Re-export validators for convenience                               */
/* -------------------------------------------------------------------------- */

export { isValidOklch, isValidHex, validateOklch } from "./validate"

/* -------------------------------------------------------------------------- */
/* BACKWARD COMPATIBILITY: Aliases for old function names                      */
/* -------------------------------------------------------------------------- */

/**
 * @deprecated Use parseOklchStringToComponents() instead.
 * This is maintained for backward compatibility with tests.
 * Converts CSS oklch() string to components with radians for hue.
 */
export const parseOklch = parseOklchStringToComponents

/**
 * @deprecated Use assertOklchString() instead.
 * This is maintained for backward compatibility with tests.
 */
export function assertOklch(value: string): OklchComponents {
  const parsed = parseOklchStringToComponents(value)
  if (!parsed) {
    throw new Error(
      `Invalid OKLch color. Expected format: oklch(L C H) or oklch(L% C H)`
    )
  }
  return parsed
}
