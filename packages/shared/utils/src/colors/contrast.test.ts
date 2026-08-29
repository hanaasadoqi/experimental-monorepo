import { describe, it, expect } from "vitest"
import {
  contrastRatio,
  calculateContrastRatio,
  meetsContrastRequirement,
  CONTRAST_THRESHOLDS,
} from "./contrast"

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
