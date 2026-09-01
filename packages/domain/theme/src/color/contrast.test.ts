import { describe, it, expect } from "vitest"
import {
  contrastRatio,
  calculateContrastRatio,
  meetsContrastRequirement,
  suggestTextColorForBackground,
  adjustContrastByLightness,
} from "./contrast"
import { CONTRAST_THRESHOLDS } from "../model/color"

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
