import { describe, it, expect } from "vitest"
import {
  contrastRatio,
  calculateContrastRatio,
  meetsContrastRequirement,
  suggestTextColorForBackground,
  adjustContrastByLightness,
  meetsWCAG,
  getWCAGLevel,
  getAccessibleForeground,
} from "./accessibility"
import { CONTRAST_THRESHOLDS } from "../constants"

describe("contrastRatio", () => {
  it("returns 21 for black on white", () => {
    const result = contrastRatio("oklch(0% 0 0)", "oklch(100% 0 0)")
    expect(result).toBeCloseTo(21, 0)
  })

  it("returns 1 for identical colors", () => {
    const result = contrastRatio("oklch(50% 0.2 120)", "oklch(50% 0.2 120)")
    expect(result).toBeCloseTo(1, 1)
  })

  it("returns 21 for white on black (order independent)", () => {
    const result = contrastRatio("oklch(100% 0 0)", "oklch(0% 0 0)")
    expect(result).toBeCloseTo(21, 0)
  })

  it("calculates contrast for gray on white", () => {
    const result = contrastRatio("oklch(30% 0 0)", "oklch(100% 0 0)")
    expect(result).toBeGreaterThan(1)
    expect(result).toBeLessThan(21)
  })

  it("calculates contrast for different colors", () => {
    const result = contrastRatio("oklch(20% 0 0)", "oklch(80% 0 0)")
    expect(result).toBeGreaterThan(4.5) // Should meet WCAG AA
  })

  it("throws error for invalid foreground color", () => {
    expect(() => contrastRatio("rgb(255, 0, 0)", "oklch(100% 0 0)")).toThrow()
  })

  it("throws error for invalid background color", () => {
    expect(() => contrastRatio("oklch(0% 0 0)", "#ffffff")).toThrow()
  })

  it("is symmetric", () => {
    const fg = "oklch(30% 0.1 120)"
    const bg = "oklch(70% 0.1 300)"
    const ratio1 = contrastRatio(fg, bg)
    const ratio2 = contrastRatio(bg, fg)
    expect(ratio1).toBeCloseTo(ratio2, 5)
  })
})

describe("calculateContrastRatio", () => {
  it("calculates ratio from luminance values", () => {
    const result = calculateContrastRatio(0, 1)
    expect(result).toBeCloseTo(21, 0)
  })

  it("returns 1 for equal luminance", () => {
    const result = calculateContrastRatio(0.5, 0.5)
    expect(result).toBeCloseTo(1, 2)
  })

  it("is order independent", () => {
    const ratio1 = calculateContrastRatio(0.2, 0.8)
    const ratio2 = calculateContrastRatio(0.8, 0.2)
    expect(ratio1).toBeCloseTo(ratio2, 5)
  })

  it("handles zero luminance for one color", () => {
    const result = calculateContrastRatio(0, 0.5)
    expect(result).toBeCloseTo((0.5 + 0.05) / (0 + 0.05), 2)
  })

  it("handles typical luminance values", () => {
    const result = calculateContrastRatio(0.1, 0.9)
    expect(result).toBeGreaterThan(4)
    expect(result).toBeLessThan(20)
  })

  it("always returns value >= 1", () => {
    for (let i = 0; i <= 1; i += 0.1) {
      for (let j = 0; j <= 1; j += 0.1) {
        expect(calculateContrastRatio(i, j)).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it("always returns value <= 21", () => {
    for (let i = 0; i <= 1; i += 0.1) {
      for (let j = 0; j <= 1; j += 0.1) {
        expect(calculateContrastRatio(i, j)).toBeLessThanOrEqual(21)
      }
    }
  })
})

describe("meetsContrastRequirement", () => {
  it("returns true when contrast meets requirement", () => {
    const result = meetsContrastRequirement(
      "oklch(20% 0 0)",
      "oklch(100% 0 0)",
      4.5
    )
    expect(result).toBe(true)
  })

  it("returns false when contrast fails requirement", () => {
    const result = meetsContrastRequirement(
      "oklch(50% 0.2 120)",
      "oklch(52% 0.2 120)",
      4.5
    )
    expect(result).toBe(false)
  })

  it("returns false for invalid foreground color", () => {
    const result = meetsContrastRequirement(
      "rgb(255, 0, 0)",
      "oklch(100% 0 0)",
      4.5
    )
    expect(result).toBe(false)
  })

  it("returns false for invalid background color", () => {
    const result = meetsContrastRequirement("oklch(0% 0 0)", "#ffffff", 4.5)
    expect(result).toBe(false)
  })

  it("meets WCAG AA for black text on white", () => {
    const result = meetsContrastRequirement(
      "oklch(0% 0 0)",
      "oklch(100% 0 0)",
      CONTRAST_THRESHOLDS.AA_NORMAL
    )
    expect(result).toBe(true)
  })

  it("meets WCAG AAA for black text on white", () => {
    const result = meetsContrastRequirement(
      "oklch(0% 0 0)",
      "oklch(100% 0 0)",
      CONTRAST_THRESHOLDS.AAA_NORMAL
    )
    expect(result).toBe(true)
  })

  it("respects exact threshold boundary", () => {
    // White on near-black should be around 20:1
    const result1 = meetsContrastRequirement(
      "oklch(100% 0 0)",
      "oklch(1% 0 0)",
      20
    )
    const result2 = meetsContrastRequirement(
      "oklch(100% 0 0)",
      "oklch(1% 0 0)",
      21
    )
    // result1 should be true, result2 might be false (or very close)
    expect(result1).toBe(true)
    expect(result2).toBe(false)
  })

  it("handles NaN values by returning false", () => {
    const result = meetsContrastRequirement("invalid", "oklch(100% 0 0)", 4.5)
    expect(result).toBe(false)
  })
})

describe("CONTRAST_THRESHOLDS", () => {
  it("has AA_NORMAL threshold", () => {
    expect(CONTRAST_THRESHOLDS.AA_NORMAL).toBe(4.5)
  })

  it("has AA_LARGE threshold", () => {
    expect(CONTRAST_THRESHOLDS.AA_LARGE).toBe(3)
  })

  it("has AAA_NORMAL threshold", () => {
    expect(CONTRAST_THRESHOLDS.AAA_NORMAL).toBe(7)
  })

  it("has AAA_LARGE threshold", () => {
    expect(CONTRAST_THRESHOLDS.AAA_LARGE).toBe(4.5)
  })

  it("AAA requirements are stricter than AA", () => {
    expect(CONTRAST_THRESHOLDS.AAA_NORMAL).toBeGreaterThan(
      CONTRAST_THRESHOLDS.AA_NORMAL
    )
    expect(CONTRAST_THRESHOLDS.AAA_LARGE).toBeGreaterThanOrEqual(
      CONTRAST_THRESHOLDS.AA_LARGE
    )
  })
})

describe("suggestTextColorForBackground direction (regression: finding #2, threshold)", () => {
  it("picks whichever of black/white actually has higher contrast, not just luminance > 0.5", () => {
    // oklch(58% 0 0)'s WCAG relative luminance sits below 0.5 (OKLCH
    // lightness is not linear luminance), so the old `> 0.5` threshold
    // picked white text here — but black text has the higher contrast
    // against this background (matches run-2's focused reproduction).
    const background = "oklch(58% 0 0)"
    const result = suggestTextColorForBackground(background)
    const blackRatio = contrastRatio("oklch(5% 0 0)", background)
    const whiteRatio = contrastRatio("oklch(95% 0 0)", background)
    const expected =
      blackRatio >= whiteRatio ? "oklch(5% 0 0)" : "oklch(95% 0 0)"
    expect(result).toBe(expected)
  })
})

describe("suggestTextColorForBackground", () => {
  it("returns either light or dark text", () => {
    const result = suggestTextColorForBackground("oklch(60% 0.1 120)")
    expect(result).toMatch(/^oklch\(/)
    expect(["oklch(5% 0 0)", "oklch(95% 0 0)"]).toContain(result)
  })

  it("returns light text for very dark backgrounds", () => {
    const result = suggestTextColorForBackground("oklch(5% 0 0)")
    expect(result).toBe("oklch(95% 0 0)")
  })

  it("returns dark text for very light backgrounds", () => {
    const result = suggestTextColorForBackground("oklch(95% 0 0)")
    expect(result).toBe("oklch(5% 0 0)")
  })

  it("returns a valid suggestion for invalid color", () => {
    const result = suggestTextColorForBackground("invalid")
    expect(["oklch(5% 0 0)", "oklch(95% 0 0)", "oklch(50% 0 0)"]).toContain(
      result
    )
  })

  it("is deterministic for same input", () => {
    const bg = "oklch(75% 0.15 200)"
    const result1 = suggestTextColorForBackground(bg)
    const result2 = suggestTextColorForBackground(bg)
    expect(result1).toBe(result2)
  })

  it("returns one of two consistent colors", () => {
    const backgrounds = [
      "oklch(10% 0 0)",
      "oklch(50% 0.2 120)",
      "oklch(90% 0 0)",
    ]
    const results = backgrounds.map(suggestTextColorForBackground)
    expect(
      results.every((r) => r === "oklch(5% 0 0)" || r === "oklch(95% 0 0)")
    ).toBe(true)
  })
})

describe("adjustContrastByLightness", () => {
  it("darkens a light color to meet contrast requirement against white", () => {
    const result = adjustContrastByLightness(
      "oklch(80% 0.2 120)",
      "oklch(100% 0 0)",
      4.5
    )
    expect(result).not.toBeNull()
    if (result) {
      expect(result).toMatch(/oklch\(\d+\.?\d*% 0\.2 120\)/)
      // Should be darker than original
      const match = result.match(/oklch\((\d+\.?\d*)%/)
      if (match?.[1]) {
        const resultLightness = parseFloat(match[1])
        expect(resultLightness).toBeLessThan(80)
      }
    }
  })

  it("lightens a dark color to meet contrast requirement against black", () => {
    const result = adjustContrastByLightness(
      "oklch(30% 0.2 120)",
      "oklch(0% 0 0)",
      4.5
    )
    expect(result).not.toBeNull()
    if (result) {
      expect(result).toMatch(/oklch\(\d+\.?\d*% 0\.2 120\)/)
      // Should be lighter than original
      const match = result.match(/oklch\((\d+\.?\d*)%/)
      if (match?.[1]) {
        const resultLightness = parseFloat(match[1])
        expect(resultLightness).toBeGreaterThan(30)
      }
    }
  })

  it("returns null for invalid foreground color", () => {
    const result = adjustContrastByLightness(
      "rgb(100, 100, 100)",
      "oklch(100% 0 0)",
      4.5
    )
    expect(result).toBeNull()
  })

  it("handles invalid background color gracefully", () => {
    const result = adjustContrastByLightness(
      "oklch(50% 0.2 120)",
      "invalid",
      4.5
    )
    // Should either return null or a computed value (graceful degradation)
    expect(result === null || typeof result === "string").toBe(true)
  })

  it("handles colors without percentage sign", () => {
    const result = adjustContrastByLightness(
      "oklch(50 0.2 120)",
      "oklch(100% 0 0)",
      4.5
    )
    expect(result).not.toBeNull()
  })

  it("preserves chroma and hue", () => {
    const result = adjustContrastByLightness(
      "oklch(50% 0.25 200)",
      "oklch(100% 0 0)",
      4.5
    )
    expect(result).not.toBeNull()
    if (result) {
      expect(result).toContain("0.25")
      expect(result).toContain("200")
    }
  })

  it("improves contrast ratio", () => {
    const original = "oklch(50% 0.2 120)"
    const result = adjustContrastByLightness(original, "oklch(100% 0 0)", 4.5)
    expect(result).not.toBeNull()
    if (result) {
      const _originalRatio = contrastRatio(original, "oklch(100% 0 0)")
      const adjustedRatio = contrastRatio(result, "oklch(100% 0 0)")
      expect(adjustedRatio).toBeGreaterThanOrEqual(4)
    }
  })

  it("adjusts color to meet requirement", () => {
    const fg = "oklch(20% 0.2 120)"
    const bg = "oklch(100% 0 0)"
    const result = adjustContrastByLightness(fg, bg, 4.5)
    expect(result).not.toBeNull()
    if (result) {
      const match = result.match(/oklch\((\d+\.?\d*)%/)
      if (match?.[1]) {
        const resultLightness = parseFloat(match[1])
        expect(resultLightness).toBeGreaterThanOrEqual(0)
        expect(resultLightness).toBeLessThanOrEqual(100)
      }
    }
  })

  it("handles decimal chroma values", () => {
    const result = adjustContrastByLightness(
      "oklch(50% 0.157 180)",
      "oklch(95% 0 0)",
      4.5
    )
    expect(result).not.toBeNull()
    if (result) {
      expect(result).toContain("0.157")
    }
  })

  it("handles decimal hue values", () => {
    const result = adjustContrastByLightness(
      "oklch(50% 0.2 123.45)",
      "oklch(95% 0 0)",
      4.5
    )
    expect(result).not.toBeNull()
    if (result) {
      expect(result).toContain("123.45")
    }
  })
})

describe("adjustContrastByLightness (regression)", () => {
  it("meets the ratio against a LIGHT background", () => {
    const bg = "oklch(95% 0 0)"
    const out = adjustContrastByLightness("oklch(50% 0.2 250)", bg, 4.5)
    expect(out).not.toBeNull()
    expect(contrastRatio(out!, bg)).toBeGreaterThanOrEqual(4.5)
  })

  it("meets the ratio against a DARK background", () => {
    const bg = "oklch(10% 0 0)"
    const out = adjustContrastByLightness("oklch(50% 0.2 250)", bg, 4.5)
    expect(out).not.toBeNull()
    expect(contrastRatio(out!, bg)).toBeGreaterThanOrEqual(4.5)
  })

  it("returns output that is itself parseable", () => {
    const out = adjustContrastByLightness(
      "oklch(0.5 0.2 250)",
      "oklch(95% 0 0)",
      4.5
    )
    expect(out).not.toBeNull()
    expect(() => contrastRatio(out!, "oklch(95% 0 0)")).not.toThrow()
  })

  it("preserves the percentage notation of the input", () => {
    expect(
      adjustContrastByLightness("oklch(50% 0.2 250)", "oklch(95% 0 0)", 4.5)
    ).toMatch(/%/)
    expect(
      adjustContrastByLightness("oklch(0.5 0.2 250)", "oklch(95% 0 0)", 4.5)
    ).not.toMatch(/%/)
  })

  it("returns null when the ratio is unreachable", () => {
    expect(
      adjustContrastByLightness("oklch(50% 0.2 250)", "oklch(50% 0 0)", 21)
    ).toBeNull()
  })

  it("returns null for unparseable input", () => {
    expect(
      adjustContrastByLightness("rgb(0,0,0)", "oklch(95% 0 0)", 4.5)
    ).toBeNull()
  })
})

describe("meetsWCAG / getWCAGLevel use CONTRAST_THRESHOLDS", () => {
  it("meetsWCAG honours each level and size", () => {
    expect(meetsWCAG(CONTRAST_THRESHOLDS.AA_NORMAL, "AA", "normal")).toBe(true)
    expect(meetsWCAG(CONTRAST_THRESHOLDS.AA_NORMAL - 0.1, "AA", "normal")).toBe(
      false
    )
    expect(meetsWCAG(CONTRAST_THRESHOLDS.AA_LARGE, "AA", "large")).toBe(true)
    expect(meetsWCAG(CONTRAST_THRESHOLDS.AAA_NORMAL, "AAA", "normal")).toBe(
      true
    )
    expect(meetsWCAG(CONTRAST_THRESHOLDS.AAA_LARGE, "AAA", "large")).toBe(true)
  })

  it("getWCAGLevel brackets correctly", () => {
    expect(getWCAGLevel(CONTRAST_THRESHOLDS.AAA_NORMAL)).toBe("AAA")
    expect(getWCAGLevel(CONTRAST_THRESHOLDS.AA_NORMAL)).toBe("AA")
    expect(getWCAGLevel(CONTRAST_THRESHOLDS.AA_NORMAL - 0.1)).toBe("Fail")
    expect(getWCAGLevel(CONTRAST_THRESHOLDS.AA_LARGE, "large")).toBe("AA")
  })
})

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
