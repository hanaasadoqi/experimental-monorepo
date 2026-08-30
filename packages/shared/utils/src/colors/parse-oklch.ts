import {
  type oklchColor,
  OKLCH_REGEX,
  oklchColorSchema,
  OklchStr,
  oklchStrSchema,
} from "./types"

/** Regex for parsing OKLch CSS color format */

const PERCENTAGE_INDEX = 2

export const validateOklch = (
  value: string | Record<string, unknown>
): {
  data?: oklchColor | OklchStr | null
  success: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any
} => {
  const normalizedSchema =
    typeof value === "string" ? oklchStrSchema : oklchColorSchema
  return normalizedSchema.safeParse(value)
}

export const isValidOklch = (
  value: string | Record<string, unknown>
): boolean => {
  return validateOklch(value).success
}

/**
 * Parses an OKLch CSS color string into normalized components.
 * @param value - CSS oklch() string (e.g., "oklch(50% 0.2 120)")
 * @returns Parsed OklchColor or null if invalid format
 * @example
 *   parseOklch("oklch(50% 0.2 120)") // => { lightness: 0.5, chroma: 0.2, hue: 2.094 }
 *   parseOklch("invalid") // => null
 */
export function parseOklch(value: string): oklchColor | null {
  if (!isValidOklch(value)) return null
  const match = value.match(OKLCH_REGEX)
  if (!match) return null

  const newOklch = {
    lightness: Number(match[1]) / (match[PERCENTAGE_INDEX] ? 100 : 1),
    chroma: Number(match[3]),
    hue: (Number(match[4]) * Math.PI) / 180,
  }
  return newOklch
}

/**
 * Strictly validates an OKLch color string (throws on invalid).
 * Use when parsing must succeed or be treated as an error.
 * @param value - CSS oklch() string
 * @returns Parsed OklchColor
 * @throws Error if the color format is invalid
 * @example
 *   assertOklch("oklch(50% 0.2 120)") // => OklchColor
 *   assertOklch("rgb(255 0 0)") // throws
 */
export function assertOklch(value: string): oklchColor {
  const color = parseOklch(value)
  if (!color) {
    throw new Error(
      `Invalid OKLch color: "${value}". Expected format: oklch(L C H) or oklch(L% C H)`
    )
  }
  return color
}
