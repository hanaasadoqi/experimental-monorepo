import { luminance, tryLuminance } from "./luminance"
import { parseOklch } from "./parse-oklch";
import { MAX_LIGHTNESS, MIN_LIGHTNESS } from "./types";
export { CONTRAST_THRESHOLDS } from "./types"



/**
 * Calculates WCAG 2.0 contrast ratio between two colors.
 * Used to verify accessibility compliance (AA: 4.5:1, AAA: 7:1 for normal text).
 * @param foreground - OKLch color for foreground text
 * @param background - OKLch color for background
 * @returns Contrast ratio (1-21) where higher is better
 * @throws Error if either color is invalid OKLch format
 * @example
 *   contrastRatio("oklch(20% 0 0)", "oklch(95% 0 0)") // => 18.5 (AAA)
 *   contrastRatio("oklch(50% 0 0)", "oklch(55% 0 0)") // => 1.2 (fails AA)
 */
export function contrastRatio(foreground: string, background: string): number {
  const fgLuminance = luminance(foreground)
  const bgLuminance = luminance(background)
  return calculateContrastRatio(fgLuminance, bgLuminance)
}

/**
 * Calculates contrast ratio from pre-computed luminance values.
 * Useful for performance-critical paths or batch processing.
 * @param l1 - First luminance value
 * @param l2 - Second luminance value
 * @returns Contrast ratio (1-21)
 */
export function calculateContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Safely checks if two colors meet a contrast ratio requirement.
 * @param foreground - OKLch foreground color
 * @param background - OKLch background color
 * @param minRatio - Minimum acceptable ratio (e.g., 4.5 for WCAG AA)
 * @returns true if contrast >= minRatio, false if invalid or insufficient
 * @example
 *   meetsContrastRequirement(
 *     "oklch(20% 0 0)",
 *     "oklch(95% 0 0)",
 *     CONTRAST_THRESHOLDS.AA_NORMAL
 *   ) // => true
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  minRatio: number
): boolean {
  const fgLuminance = tryLuminance(foreground)
  const bgLuminance = tryLuminance(background)

  if (fgLuminance === null || bgLuminance === null) {
    return false
  }

  return calculateContrastRatio(fgLuminance, bgLuminance) >= minRatio
}


/**
 * Suggests an accessible text color (light or dark) for a given background.
 * Returns either near-white or near-black depending on background luminance.
 * @param background - OKLch background color
 * @returns "oklch(5% 0 0)" for light backgrounds, "oklch(95% 0 0)" for dark backgrounds
 * @example
 *   suggestTextColorForBackground("oklch(80% 0.1 250)")
 *   // => "oklch(5% 0 0)" (dark text on light background)
 */
export function suggestTextColorForBackground(background: string): string {
  try {
    const bgLuminance = tryLuminance(background)
    return bgLuminance !== null && bgLuminance > 0.5 ? "oklch(5% 0 0)" : "oklch(95% 0 0)"
  } catch {
    return "oklch(50% 0 0)"
  }
}

/**
 * Adjusts a color's lightness to meet a minimum contrast ratio against a background.
 * Binary searches for the optimal lightness that satisfies the requirement.
 * @param foreground - OKLch color to adjust (e.g., "oklch(50% 0.2 250)")
 * @param background - OKLch background color
 * @param minRatio - Minimum required contrast ratio (e.g., 4.5 for WCAG AA)
 * @returns Adjusted OKLch string with modified lightness, null if invalid input
 * @example
 *   adjustContrastByLightness("oklch(50% 0.2 250)", "oklch(95% 0 0)", 4.5)
 *   // => "oklch(30% 0.2 250)" or similar darkened color
 */
export function adjustContrastByLightness(
  foreground: string,
  background: string,
  minRatio: number
): string | null {
  try {
    const fgRegexMatch = foreground.match(/^oklch\(([\d.]+)(%?)?\s+([\d.]+)\s+([\d.]+)\)$/)
    if (!fgRegexMatch) return null

    const chroma = fgRegexMatch[3]
    const hue = fgRegexMatch[4]
    const hasPercent = fgRegexMatch[2] === "%" ? "%" : ""

    let low = 0
    let high = 100
    let bestLightness = parseFloat(fgRegexMatch[1])

    for (let i = 0; i < 20; i++) {
      const mid = (low + high) / 2
      const testColor = `oklch(${mid}${hasPercent} ${chroma} ${hue})`

      if (meetsContrastRequirement(testColor, background, minRatio)) {
        bestLightness = mid
        high = mid
      } else {
        low = mid
      }
    }

    return `oklch(${bestLightness.toFixed(2)}${hasPercent} ${chroma} ${hue})`
  } catch {
    return null
  }
}
