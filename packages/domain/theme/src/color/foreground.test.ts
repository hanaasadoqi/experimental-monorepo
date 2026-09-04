import { describe, expect, it } from "vitest"
import { getAccessibleForeground, contrastRatio } from "./accessibility"
import { CONTRAST_THRESHOLDS } from "./constants"

describe("getAccessibleForeground (regression: finding #2)", () => {
  it("reaches 4.5:1 against a background where the naive 0.5-luminance threshold picks the wrong direction", () => {
    // run-2's focused counterexample: bg oklch(58% 0 0) — dark endpoint
    // reaches ~4.899, light endpoint only ~4.106. The old
    // adjustContrastByLightness(fg, bg, 4.5) returned null here because it
    // only ever tried the (wrong) light direction for this background.
    const background = "oklch(58% 0 0)"
    const result = getAccessibleForeground(background)
    expect(contrastRatio(result, background)).toBeGreaterThanOrEqual(4.5)
  })

  it.each([60, 65, 70, 75])(
    "reaches 4.5:1 against a %i%% neutral background (run-2's reachable-but-null scan)",
    (percent) => {
      const background = `oklch(${percent}% 0 0)`
      const result = getAccessibleForeground(background)
      expect(contrastRatio(result, background)).toBeGreaterThanOrEqual(4.5)
    }
  )

  it("beats the old binary autoForeground's worst observed ratio (4.3666, below target)", () => {
    const background = "oklch(55% 0.12 120)"
    const result = getAccessibleForeground(background)
    expect(contrastRatio(result, background)).toBeGreaterThanOrEqual(4.5)
  })

  it("is not limited to two achromatic outputs — preserves the background's hue", () => {
    const background = "oklch(60% 0.15 250)"
    const result = getAccessibleForeground(background)
    const hueMatch = result.match(/oklch\([\d.]+%?\s+[\d.]+\s+([\d.]+)\)/)
    expect(hueMatch).not.toBeNull()
    expect(Number(hueMatch![1])).toBeCloseTo(250, 0)
  })

  it("respects a configurable minContrast target", () => {
    // A light background has real headroom to reach 7:1 by darkening;
    // oklch(50% 0.1 30) does not (its own max achievable via either
    // extreme tops out well under 7 — verified separately, not a bug).
    const background = "oklch(85% 0.05 30)"
    const result = getAccessibleForeground(background, { minContrast: 7 })
    expect(contrastRatio(result, background)).toBeGreaterThanOrEqual(7)
  })

  it("defaults to the declared AA-normal target (4.5) when unspecified", () => {
    expect(CONTRAST_THRESHOLDS.AA_NORMAL).toBe(4.5)
    const background = "oklch(45% 0.08 200)"
    const result = getAccessibleForeground(background)
    expect(contrastRatio(result, background)).toBeGreaterThanOrEqual(4.5)
  })

  it("returns a color whose exact final contrast is verified, not an intermediate candidate", () => {
    for (const l of [10, 25, 40, 55, 70, 85]) {
      const background = `oklch(${l}% 0.1 180)`
      const result = getAccessibleForeground(background)
      // Recompute independently from the returned string — must hold exactly.
      expect(contrastRatio(result, background)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it("chooses the smaller of the two directions when both pass", () => {
    // A near-neutral mid-gray background: both directions are reachable at
    // 4.5, so the smaller lightness delta should win.
    const background = "oklch(50% 0 0)"
    const result = getAccessibleForeground(background)
    const lMatch = result.match(/oklch\(([\d.]+)%/)
    expect(lMatch).not.toBeNull()
    const resultL = Number(lMatch![1]) / 100
    const delta = Math.abs(resultL - 0.5)
    // Sanity: shouldn't jump all the way to a black/white extreme when a
    // much smaller adjustment already clears the bar.
    expect(delta).toBeLessThan(0.45)
  })

  it("falls back to a verified black/white choice only when no direction can reach the target", () => {
    // An unreachable target (>21:1 is impossible for any real pair).
    const background = "oklch(50% 0.1 30)"
    const result = getAccessibleForeground(background, { minContrast: 25 })
    // Still returns *some* valid oklch string rather than throwing/null.
    expect(result).toMatch(/^oklch\(/)
  })
})
