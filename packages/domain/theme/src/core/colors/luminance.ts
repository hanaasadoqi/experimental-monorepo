import {
  transformOklchToLMS,
  transformLMStoRgb,
  calculateLuminanceFromRgb,
} from "./transforms"
import { parseOklch, assertOklch } from "./parse-oklch"
import { oklchColor } from "./defaults"

/**
 * Calculates relative luminance from an OKLch color string per WCAG 2.0.
 * Used for accessibility contrast calculations and perceptually uniform color operations.
 * @param value - OKLch color string (e.g., "oklch(50% 0.2 120)")
 * @returns Luminance value (0-1) where 0=black, 1=white
 * @throws Error if the color string is not valid OKLch format
 * @example
 *   luminance("oklch(100% 0 0)")   // => 1 (white)
 *   luminance("oklch(0% 0 0)")     // => 0 (black)
 *   luminance("oklch(50% 0.1 60)") // => ~0.18
 */
export function luminance(value: string): number {
  const oklchColor = assertOklch(value)
  return luminanceFromOklch(oklchColor)
}

/**
 * Calculates luminance from already-parsed OKLch components.
 * Useful for batch processing or when parsing has already been validated.
 * @param oklch - Parsed OKLch color components
 * @returns Luminance value (0-1)
 */
export function luminanceFromOklch(oklch: oklchColor): number {
  const lms = transformOklchToLMS(oklch)
  const rgb = transformLMStoRgb(lms)
  return calculateLuminanceFromRgb(rgb)
}

/**
 * Safely calculates luminance, returning null if the color is invalid.
 * Use when you want to handle invalid colors gracefully without throwing.
 * @param value - OKLch color string
 * @returns Luminance (0-1) or null if parsing fails
 * @example
 *   tryLuminance("oklch(50% 0.2 120)") // => 0.42
 *   tryLuminance("invalid") // => null
 */
export function tryLuminance(value: string): number | null {
  const oklchColor = parseOklch(value)
  return oklchColor ? luminanceFromOklch(oklchColor) : null
}
