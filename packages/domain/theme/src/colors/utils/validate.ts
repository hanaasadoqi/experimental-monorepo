import {
  oklchColorSchema,
  oklchComponentsSchema,
  oklchStrSchema,
  type OklchColor,
  type OklchComponents,
  type OklchInput,
  type OklchString,
} from "./core-model"

export const PERCENTAGE_INDEX = 2

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
 *
 *
 */

/** A finite number is byte 0..255 — used for the r/g/b channels of validateRgba. */
const isValidByteChannel = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 255

export function validateRgba(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false
  const { r, g, b, a } = value as {
    r?: unknown
    g?: unknown
    b?: unknown
    a?: unknown
  }
  return (
    isValidByteChannel(r) &&
    isValidByteChannel(g) &&
    isValidByteChannel(b) &&
    (a === undefined ||
      (typeof a === "number" && Number.isFinite(a) && a >= 0 && a <= 1))
  )
}

export function validateOklch(
  value: OklchInput | unknown
): OklchValidationResult {
  if (!value)
    return {
      success: false,
      error: new TypeError("Value is null or undefined"),
    }
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

/**
 * Validate that a hex string is in valid format: `#` followed by 3 or 6 hex
 * digits. Matches `hexStrSchema`/`hexColorSchema` in model.ts exactly — this
 * function used to accept unprefixed and 8-digit (alpha) forms that those
 * schemas reject, which let a string treated as "valid" by one path fail
 * downstream at another (finding #4d).
 */
export function isValidHex(hexString: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hexString)
}
