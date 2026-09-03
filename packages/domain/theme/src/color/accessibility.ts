import { CONTRAST_THRESHOLDS, OKLCH_REGEX } from "./constants"
import { luminance, tryLuminance } from "./luminance"

/**
 * Calculates WCAG 2.0 contrast ratio between two colors.
 * @param foreground - OKLch color for foreground text
 * @param background - OKLch color for background
 * @returns Contrast ratio (1-21) where higher is better
 * @throws Error if either color is invalid OKLch format
 * @example
 *   contrastRatio("oklch(20% 0 0)", "oklch(95% 0 0)") // => 18.5 (AAA)
 */
export function contrastRatio(foreground: string, background: string): number {
  return calculateContrastRatio(luminance(foreground), luminance(background))
}

/**
 * Calculates contrast ratio from pre-computed luminance values.
 * Useful for performance-critical paths or batch processing.
 */
export function calculateContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Safely checks if two colors meet a contrast ratio requirement.
 * @returns true if contrast >= minRatio, false if invalid or insufficient
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
 * @returns "oklch(5% 0 0)" for light backgrounds, "oklch(95% 0 0)" for dark
 */
export function suggestTextColorForBackground(background: string): string {
  // `tryLuminance` returns null rather than throwing, so no catch is needed.
  const bgLuminance = tryLuminance(background)
  return bgLuminance !== null && bgLuminance > 0.5
    ? "oklch(5% 0 0)"
    : "oklch(95% 0 0)"
}

/**
 * Adjusts a foreground color's lightness until it meets a minimum contrast
 * ratio against the background, moving as little as possible.
 *
 * Direction is chosen from the background: darken against a light background,
 * lighten against a dark one. The candidate string is built with its final
 * rounding *inside* the search, so the value returned is the exact value that
 * was verified — a returned color always meets `minRatio`.
 *
 * @returns Adjusted OKLch string, or null if the input is unparseable or no
 *          lightness in range can reach the requested ratio.
 * @example
 *   adjustContrastByLightness("oklch(50% 0.2 250)", "oklch(95% 0 0)", 4.5)
 */
export function adjustContrastByLightness(
  foreground: string,
  background: string,
  minRatio: number
): string | null {
  const match = foreground.match(OKLCH_REGEX)
  if (!match?.[1] || !match[3] || !match[4]) return null

  const bgLuminance = tryLuminance(background)
  if (bgLuminance === null) return null

  const usesPercent = match[2] === "%"
  const chroma = match[3]
  const hue = match[4]

  // Lightness is expressed on 0..100 when the source used a percentage, 0..1
  // otherwise. Searching the wrong scale yields unparseable output.
  const scale = usesPercent ? 100 : 1
  const digits = usesPercent ? 2 : 4
  const format = (l: number) =>
    `oklch(${l.toFixed(digits)}${usesPercent ? "%" : ""} ${chroma} ${hue})`

  // Contrast rises as the foreground moves away from the background. On a light
  // background the qualifying set is [0, Lmax] and we want its upper bound; on a
  // dark background it is [Lmin, scale] and we want its lower bound. Either way
  // that is the smallest change from the original color.
  const darken = bgLuminance > 0.5

  let lo = 0
  let hi = scale
  let best: string | null = null

  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2
    const candidate = format(mid)

    if (meetsContrastRequirement(candidate, background, minRatio)) {
      best = candidate
      if (darken) lo = mid
      else hi = mid
    } else if (darken) {
      hi = mid
    } else {
      lo = mid
    }
  }

  return best
}

/** The minimum ratio for a given WCAG level and text size. */
function threshold(level: "AA" | "AAA", size: "normal" | "large"): number {
  if (level === "AA") {
    return size === "large"
      ? CONTRAST_THRESHOLDS.AA_LARGE
      : CONTRAST_THRESHOLDS.AA_NORMAL
  }
  return size === "large"
    ? CONTRAST_THRESHOLDS.AAA_LARGE
    : CONTRAST_THRESHOLDS.AAA_NORMAL
}

export function meetsWCAG(
  contrastRatio: number,
  level: "AA" | "AAA" = "AA",
  size: "normal" | "large" = "normal"
): boolean {
  return contrastRatio >= threshold(level, size)
}

export function getWCAGLevel(
  contrastRatio: number,
  size: "normal" | "large" = "normal"
): "AAA" | "AA" | "Fail" {
  if (contrastRatio >= threshold("AAA", size)) return "AAA"
  if (contrastRatio >= threshold("AA", size)) return "AA"
  return "Fail"
}
