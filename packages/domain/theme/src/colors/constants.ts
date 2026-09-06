/**
 * Color constants: bounds, thresholds, defaults, and lookup tables.
 * No types and no logic — see `./model` and the sibling algorithm files.
 */

export const OKLCH_REGEX = /^oklch\(([\d.]+)(%?)?\s+([\d.]+)\s+([\d.]+)\)$/

/** A single clean numeric token: optional sign, digits, at most one decimal
 * point, optional trailing `%`. Used to validate bare-triplet color input
 * tokens before `Number.parseFloat`, which would otherwise silently accept
 * the numeric prefix of malformed text like `"30.2.3"`. */
export const NUMERIC_TOKEN_REGEX = /^-?\d+(\.\d+)?%?$/

/** WCAG 2.0 contrast ratio thresholds. */
export const CONTRAST_THRESHOLDS = {
  AA_NORMAL: 4.5, // Normal text, AA level
  AA_LARGE: 3, // Large text (18pt+), AA level
  AAA_NORMAL: 7, // Normal text, AAA level
  AAA_LARGE: 4.5, // Large text, AAA level
} as const

/* -------------------------------------------------------------------------- */
/* Channel bounds                                                             */
/* -------------------------------------------------------------------------- */

export const MIN_LIGHTNESS = 0
export const MAX_LIGHTNESS = 1
export const MIN_CHROMA = 0
export const MAX_CHROMA = 0.4
export const MIN_HUE = 0
export const MAX_HUE = 360

export const DEFAULT_PRIMARY_BASE = "oklch(65% 0.15 250)"

/** Target lightness per step, independent of the base color. */
export const STEP_LIGHTNESS: Record<number, number> = {
  50: 0.97,
  100: 0.93,
  200: 0.86,
  300: 0.77,
  400: 0.68,
  500: 0.58,
  600: 0.49,
  700: 0.4,
  800: 0.31,
  900: 0.23,
  950: 0.16,
}

export const COLOR_TYPE_OPTIONS = ["hex", "oklch", "rgb", ""] as const
