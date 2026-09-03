import { converter } from "culori"

import { MAX_CHROMA, OKLCH_REGEX, MAX_HUE, MAX_LIGHTNESS, MIN_CHROMA, MIN_HUE, MIN_LIGHTNESS } from "./constants"
import { clampC, clampH, clampL } from "./gamut"
import { normalizeHex, normalizeRgbBytes } from "./normalize"
import {
  oklchColorSchema,
  oklchComponentsSchema,
  oklchStrSchema,
  type Oklch,
  type OklchColor,
  type OklchComponents,
  type OklchInput,
  type OklchString,
} from "./model"
import { toOklch } from "./convert"

const culoriToOklch = converter("oklch")

const PERCENTAGE_INDEX = 2

/* -------------------------------------------------------------------------- */
/* Validation: Hex                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Validate that a hex string is in valid format (3, 6, or 8 hex characters).
 */
export function isValidHex(hexString: string): boolean {
  const cleaned = hexString.replace(/^#/, "")
  return /^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(cleaned)
}

/* -------------------------------------------------------------------------- */
/* Validation: OKLCH mediator                                                 */
/* -------------------------------------------------------------------------- */

export interface OklchValidationResult {
  success: boolean
  data?: OklchString | OklchColor | OklchComponents | null
  /** The shape that matched, for callers that need to branch on it. */
  kind?: "string" | "color" | "components"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any
}

/**
 * Validate any OKLCH input the package can produce, and report which shape it
 * was. This is the single entry point for validation — callers should not pick
 * a schema by hand, because the three shapes are easy to confuse:
 *
 *   - `"oklch(50% 0.2 120)"`            -> `kind: "string"`
 *   - `{ l, c, h }`      (degrees)      -> `kind: "color"`
 *   - `{ lightness, chroma, hue }` (rad)-> `kind: "components"`
 *
 * The object shapes are unambiguous — neither has the other's required keys —
 * so no ordering heuristic is needed.
 */
export function validateOklch(
  value: OklchInput | unknown
): OklchValidationResult {
  if (typeof value === "string") {
    const parsed = oklchStrSchema.safeParse(value)
    return parsed.success
      ? { success: true, data: parsed.data, kind: "string" }
      : { success: false, error: parsed.error }
  }

  if (value !== null && typeof value === "object") {
    const asColor = oklchColorSchema.safeParse(value)
    if (asColor.success) {
      return { success: true, data: asColor.data, kind: "color" }
    }

    const asComponents = oklchComponentsSchema.safeParse(value)
    if (asComponents.success) {
      return { success: true, data: asComponents.data, kind: "components" }
    }

    return { success: false, error: asColor.error }
  }

  return {
    success: false,
    error: new TypeError(
      "Expected an oklch() string, an OklchColor, or OklchComponents"
    ),
  }
}

export const isValidOklch = (value: OklchInput | unknown): boolean =>
  validateOklch(value).success

/* -------------------------------------------------------------------------- */
/* Parsing: Strict CSS oklch() string                                        */
/* -------------------------------------------------------------------------- */

/**
 * Parse a CSS `oklch()` string into the computation form.
 *
 * Hue is converted from degrees to **radians**, because the downstream
 * `transformOklchToLMS` feeds it directly into `Math.cos` / `Math.sin`.
 * For the persisted `{ l, c, h }` form, use `parseColorInput` instead.
 *
 * @example
 *   parseOklch("oklch(50% 0.2 120)") // => { lightness: 0.5, chroma: 0.2, hue: 2.094 }
 *   parseOklch("invalid")            // => null
 */
export function parseOklch(value: string): OklchComponents | null {
  const match = value.match(OKLCH_REGEX)
  if (!match) return null

  return {
    lightness: Number(match[1]) / (match[PERCENTAGE_INDEX] ? 100 : 1),
    chroma: Number(match[3]),
    hue: (Number(match[4]) * Math.PI) / 180,
  }
}

/**
 * Strictly parse a CSS `oklch()` string, throwing on invalid input.
 * Use when parsing must succeed or be treated as an error.
 */
export function assertOklch(value: string): OklchComponents {
  const color = parseOklch(value)
  if (!color) {
    throw new Error(
      `Invalid OKLch color: "${value}". Expected format: oklch(L C H) or oklch(L% C H)`
    )
  }
  return color
}

/* -------------------------------------------------------------------------- */
/* Parsing: Lenient input → Oklch color form (degrees, not radians)          */
/* -------------------------------------------------------------------------- */

/**
 * Parse hex string (#abc or #abcdef) to OKLch.
 * Returns null if invalid.
 */
export function parseHexToOklch(hexString: string): Oklch | null {
  if (!isValidHex(hexString)) return null
  try {
    const normalized = normalizeHex(hexString)
    // Parse hex manually: #rrggbb
    const hex = normalized.replace("#", "")
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)

    // Normalize to 0-1 range and convert to OKLch
    const rgb = normalizeRgbBytes({ r, g, b })
    return toOklch(rgb)
  } catch {
    return null
  }
}

/**
 * Parse CSS oklch() string to OKLch object (degrees form).
 * Handles: oklch(0.5 0.1 45) or oklch(50% 0.1 45deg)
 * Returns null if invalid.
 */
export function parseOklchString(oklchString: string): Oklch | null {
  const match = oklchString.match(
    /oklch\s*\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)deg?\s*\)/i
  )
  if (!match) return null

  try {
    let l = parseFloat(match[1] ?? "0")
    const c = parseFloat(match[2] ?? "0")
    let h = parseFloat(match[3] ?? "0")

    // Handle percentage lightness (e.g., 50% → 0.5)
    if (match[1]?.includes("%")) {
      l = l / 100
    }

    // Validate ranges inline
    if (
      l < MIN_LIGHTNESS ||
      l > MAX_LIGHTNESS ||
      c < MIN_CHROMA ||
      c > MAX_CHROMA ||
      h < MIN_HUE ||
      h > MAX_HUE
    ) {
      return null
    }

    return { l, c, h }
  } catch {
    return null
  }
}

/**
 * Parse CSS rgb() or rgba(255, 128, 0) string to OKLch.
 * Returns null if invalid.
 */
export function parseRgbStringToOklch(rgbString: string): Oklch | null {
  const match = rgbString.match(
    /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/i
  )
  if (!match) return null

  try {
    const r = parseInt(match[1] ?? "0", 10)
    const g = parseInt(match[2] ?? "0", 10)
    const b = parseInt(match[3] ?? "0", 10)
    const alpha = match[4] ? parseFloat(match[4]) : undefined

    if (
      r < 0 ||
      r > 255 ||
      g < 0 ||
      g > 255 ||
      b < 0 ||
      b > 255 ||
      (alpha !== undefined && (alpha < 0 || alpha > 1))
    ) {
      return null
    }

    const rgb = normalizeRgbBytes({ r, g, b, alpha })
    return toOklch(rgb)
  } catch {
    return null
  }
}

/**
 * Parse a hex string (#rgb, #rrggbb) into OKLCH (degrees form).
 * Returns null if invalid.
 */
export function hexToOklch(hex: string): Oklch | null {
  const trimmed = hex.trim()
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) return null
  const parsed = culoriToOklch(trimmed)
  if (!parsed) return null
  return {
    l: parsed.l ?? 0,
    c: parsed.c ?? 0,
    h: parsed.h ?? 0,
  }
}

/**
 * Parse user-typed color input into the persisted `{ l, c, h }` form, hue in
 * degrees. Deliberately lenient, unlike `parseOklch`, and accepts:
 *   - a CSS function:  "oklch(0.7 0.15 250)" or "oklch(70% 0.15 250)"
 *   - a bare triplet:  "0.7 0.15 250"
 *   - a hex color:     "#3366ff"
 *
 * Out-of-range channels are clamped rather than rejected.
 */
export function parseColorInput(input: string): Oklch | null {
  const raw = input.trim()
  if (!raw) return null

  if (raw.startsWith("#")) {
    return hexToOklch(raw)
  }

  const fnMatch = raw.match(/^oklch\(([^)]+)\)$/i)
  const body = fnMatch ? fnMatch[1] : raw
  const parts = body
    ?.replace(/\//g, " ")
    .split(/[\s,]+/)
    .filter(Boolean)

  if (!parts || parts.length < 3) return null

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

  if ([l, c, h].some((n) => Number.isNaN(n))) return null

  return {
    l: clampL(l),
    c: clampC(c),
    h: clampH(h),
  }
}
