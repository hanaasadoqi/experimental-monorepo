import { CONTRAST_THRESHOLDS, OKLCH_REGEX } from "../constants"
import { oklchToCss } from "./convert"
import { maxChromaInGamut } from "./gamut"
import { luminance, tryLuminance } from "./luminance"
import { parseOklchString } from "./parse"

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

const NEAR_BLACK = "oklch(5% 0 0)"
const NEAR_WHITE = "oklch(95% 0 0)"

/**
 * Suggests an accessible text color (light or dark) for a given background.
 *
 * Picks whichever of near-black/near-white actually has the higher contrast
 * against `background`, computed directly — not inferred from a
 * `luminance > 0.5` threshold. That threshold is not where the two options'
 * contrast is actually equal (the real crossover is near relative luminance
 * 0.179, not 0.5), so for backgrounds in that gap it picked the option with
 * *lower* contrast (see the regression test using `oklch(58% 0 0)`, where
 * black text wins despite luminance being below 0.5).
 *
 * @returns "oklch(5% 0 0)" or "oklch(95% 0 0)", whichever wins
 */
export function suggestTextColorForBackground(background: string): string {
  const bgLuminance = tryLuminance(background)
  if (bgLuminance === null) return NEAR_BLACK

  const blackRatio = calculateContrastRatio(
    luminanceOf(NEAR_BLACK),
    bgLuminance
  )
  const whiteRatio = calculateContrastRatio(
    luminanceOf(NEAR_WHITE),
    bgLuminance
  )
  return blackRatio >= whiteRatio ? NEAR_BLACK : NEAR_WHITE
}

function luminanceOf(color: string): number {
  // NEAR_BLACK/NEAR_WHITE are fixed, always-valid literals — non-null here.
  return tryLuminance(color) as number
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

export interface GetAccessibleForegroundOptions {
  /** Minimum contrast ratio the returned color must meet. Defaults to the
   * declared AA-normal target. */
  minContrast?: number
}

/**
 * Generate a foreground color for `background` that is both perceptually
 * related to it (same hue, chroma reduced for legibility — not a flat
 * black/white swap) and independently verified to meet `minContrast`
 * (default: `CONTRAST_THRESHOLDS.AA_NORMAL`, 4.5:1).
 *
 * Unlike `suggestTextColorForBackground`/`adjustContrastByLightness`, this
 * evaluates BOTH the lighter and darker directions and picks the smaller
 * adjustment, rather than committing to one via a `luminance > 0.5`
 * threshold. That threshold is not where black-vs-white contrast is
 * actually equal (the real crossover is near relative luminance 0.179, not
 * 0.5) — for backgrounds in that gap, the threshold-based approach can
 * search only the direction that provably cannot reach the target while the
 * other direction can.
 *
 * Falls back to `suggestTextColorForBackground` (plain black/white) only
 * when NEITHER direction can reach `minContrast` at any lightness — an
 * explicit, documented fallback policy, not the primary algorithm.
 */
export function getAccessibleForeground(
  background: string,
  options: GetAccessibleForegroundOptions = {}
): string {
  const minContrast = options.minContrast ?? CONTRAST_THRESHOLDS.AA_NORMAL
  const bg = parseOklchString(background)
  if (!bg) return suggestTextColorForBackground(background)

  // Related candidate: same hue as the background (the "related" character
  // the contract calls for), chroma reduced rather than matched 1:1 — text
  // is legible at lower saturation than the surfaces/backgrounds it sits on.
  const relatedChroma = Math.min(bg.c * 0.5, 0.08)

  const searchDirection = (
    direction: "darken" | "lighten"
  ): { l: number; c: number } | null => {
    let lo = direction === "darken" ? 0 : bg.l
    let hi = direction === "darken" ? bg.l : 1
    let best: { l: number; c: number } | null = null

    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2
      const c = Math.min(relatedChroma, maxChromaInGamut(mid, bg.h))
      const candidate = oklchToCss({ l: mid, c, h: bg.h })

      if (meetsContrastRequirement(candidate, background, minContrast)) {
        best = { l: mid, c }
        // Smallest adjustment = the boundary closest to bg.l that still
        // passes, approached from the passing side.
        if (direction === "darken") lo = mid
        else hi = mid
      } else if (direction === "darken") {
        hi = mid
      } else {
        lo = mid
      }
    }
    return best
  }

  const darker = searchDirection("darken")
  const lighter = searchDirection("lighten")

  const picked = (() => {
    if (darker && lighter) {
      const darkerDelta = bg.l - darker.l
      const lighterDelta = lighter.l - bg.l
      return darkerDelta <= lighterDelta ? darker : lighter
    }
    return darker ?? lighter
  })()

  if (!picked) {
    // Neither direction reaches minContrast at any lightness for this
    // background (e.g. an unreachably high target) — documented fallback.
    return suggestTextColorForBackground(background)
  }

  const finalCss = oklchToCss({ l: picked.l, c: picked.c, h: bg.h })
  // Verify the EXACT returned color, not an intermediate candidate.
  return meetsContrastRequirement(finalCss, background, minContrast)
    ? finalCss
    : suggestTextColorForBackground(background)
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
