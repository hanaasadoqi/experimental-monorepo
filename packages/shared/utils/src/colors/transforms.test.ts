import { describe, it, expect } from "vitest"
import {
  transformOklchToLMS,
  transformLMStoRgb,
  calculateLuminanceFromRgb,
  OKLCH_TO_LMS_COEFFICIENTS,
  LMS_TO_RGB_MATRIX,
  RGB_TO_LUMINANCE_WEIGHTS,
} from "./transforms"

describe("transformOklchToLMS", () => {
  it("converts white oklch to high LMS values", () => {
    const result = transformOklchToLMS({
      lightness: 1,
      chroma: 0,
      hue: 0,
    })
    expect(result.l).toBeCloseTo(1, 2)
    expect(result.m).toBeCloseTo(1, 2)
    expect(result.s).toBeCloseTo(1, 2)
  })

  it("converts black oklch to low LMS values", () => {
    const result = transformOklchToLMS({
      lightness: 0,
      chroma: 0,
      hue: 0,
    })
    expect(result.l).toBeCloseTo(0, 2)
    expect(result.m).toBeCloseTo(0, 2)
    expect(result.s).toBeCloseTo(0, 2)
  })

  it("converts mid-tone gray oklch", () => {
    const result = transformOklchToLMS({
      lightness: 0.5,
      chroma: 0,
      hue: 0,
    })
    // Should be close to each other since no chroma (achromatic)
    expect(result.l).toBeCloseTo(result.m, 1)
    expect(result.m).toBeCloseTo(result.s, 1)
  })

  it("handles hue rotation affecting LMS", () => {
    const baseColor = { lightness: 0.5, chroma: 0.2, hue: 0 }
    const rotatedColor = { lightness: 0.5, chroma: 0.2, hue: Math.PI / 2 }

    const base = transformOklchToLMS(baseColor)
    const rotated = transformOklchToLMS(rotatedColor)

    // Different hues should produce different LMS distributions
    // But with low chroma, differences may be small, so we check for any difference
    const baseLMS = [base.l, base.m, base.s]
    const rotatedLMS = [rotated.l, rotated.m, rotated.s]

    // At least some component should be significantly different
    const hasDifference = baseLMS.some(
      (val, i) => Math.abs(val - (rotatedLMS[i] ?? 0)) > 0.01
    )
    expect(hasDifference).toBe(true)
  })

  it("handles high chroma saturation", () => {
    const result = transformOklchToLMS({
      lightness: 0.5,
      chroma: 0.35,
      hue: Math.PI / 4,
    })
    // Result should be valid positive numbers
    expect(result.l).toBeGreaterThan(0)
    expect(result.m).toBeGreaterThan(0)
    expect(result.s).toBeGreaterThan(0)
  })
})

describe("transformLMStoRgb", () => {
  it("converts white LMS to white RGB", () => {
    const result = transformLMStoRgb({ l: 1, m: 1, s: 1 })
    expect(result[0]).toBeCloseTo(1, 1)
    expect(result[1]).toBeCloseTo(1, 1)
    expect(result[2]).toBeCloseTo(1, 1)
  })

  it("converts black LMS to black RGB", () => {
    const result = transformLMStoRgb({ l: 0, m: 0, s: 0 })
    expect(result[0]).toBeCloseTo(0, 1)
    expect(result[1]).toBeCloseTo(0, 1)
    expect(result[2]).toBeCloseTo(0, 1)
  })

  it("clamps values to 0-1 range", () => {
    const result = transformLMStoRgb({ l: 1.5, m: -0.5, s: 0.5 })
    expect(result[0]).toBeGreaterThanOrEqual(0)
    expect(result[0]).toBeLessThanOrEqual(1)
    expect(result[1]).toBeGreaterThanOrEqual(0)
    expect(result[1]).toBeLessThanOrEqual(1)
    expect(result[2]).toBeGreaterThanOrEqual(0)
    expect(result[2]).toBeLessThanOrEqual(1)
  })

  it("converts red-biased LMS", () => {
    const result = transformLMStoRgb({ l: 0.5, m: 0.2, s: 0.2 })
    expect(result[0]).toBeGreaterThan(result[1])
    expect(result[0]).toBeGreaterThan(result[2])
  })

  it("converts green-biased LMS", () => {
    const result = transformLMStoRgb({ l: 0.2, m: 0.5, s: 0.2 })
    expect(result[1]).toBeGreaterThan(result[0])
    expect(result[1]).toBeGreaterThan(result[2])
  })

  it("converts blue-biased LMS", () => {
    const result = transformLMStoRgb({ l: 0.2, m: 0.2, s: 0.5 })
    expect(result[2]).toBeGreaterThan(result[0])
    expect(result[2]).toBeGreaterThan(result[1])
  })

  it("handles mid-tone gray", () => {
    const result = transformLMStoRgb({ l: 0.5, m: 0.5, s: 0.5 })
    expect(result[0]).toBeCloseTo(result[1], 1)
    expect(result[1]).toBeCloseTo(result[2], 1)
  })

  it("returns readonly tuple", () => {
    const result = transformLMStoRgb({ l: 0.5, m: 0.5, s: 0.5 })
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(3)
  })
})

describe("calculateLuminanceFromRgb", () => {
  it("calculates luminance for white", () => {
    const luminance = calculateLuminanceFromRgb([1, 1, 1])
    expect(luminance).toBeCloseTo(1, 2)
  })

  it("calculates luminance for black", () => {
    const luminance = calculateLuminanceFromRgb([0, 0, 0])
    expect(luminance).toBeCloseTo(0, 2)
  })

  it("calculates luminance for red", () => {
    const luminance = calculateLuminanceFromRgb([1, 0, 0])
    expect(luminance).toBeLessThan(calculateLuminanceFromRgb([0, 1, 0]))
  })

  it("calculates luminance for green (highest sensitivity)", () => {
    const red = calculateLuminanceFromRgb([1, 0, 0])
    const green = calculateLuminanceFromRgb([0, 1, 0])
    const blue = calculateLuminanceFromRgb([0, 0, 1])
    expect(green).toBeGreaterThan(red)
    expect(green).toBeGreaterThan(blue)
  })

  it("calculates luminance for gray", () => {
    const luminance = calculateLuminanceFromRgb([0.5, 0.5, 0.5])
    expect(luminance).toBeCloseTo(0.5, 1)
  })

  it("uses correct WCAG weights", () => {
    // Red only with full intensity
    const redLum = calculateLuminanceFromRgb([1, 0, 0])
    expect(redLum).toBeCloseTo(RGB_TO_LUMINANCE_WEIGHTS[0], 2)

    // Green only with full intensity
    const greenLum = calculateLuminanceFromRgb([0, 1, 0])
    expect(greenLum).toBeCloseTo(RGB_TO_LUMINANCE_WEIGHTS[1], 2)

    // Blue only with full intensity
    const blueLum = calculateLuminanceFromRgb([0, 0, 1])
    expect(blueLum).toBeCloseTo(RGB_TO_LUMINANCE_WEIGHTS[2], 2)
  })
})

describe("Color transformation constants", () => {
  it("OKLCH_TO_LMS_COEFFICIENTS has correct structure", () => {
    expect(OKLCH_TO_LMS_COEFFICIENTS).toHaveProperty("L")
    expect(OKLCH_TO_LMS_COEFFICIENTS).toHaveProperty("M")
    expect(OKLCH_TO_LMS_COEFFICIENTS).toHaveProperty("S")
    expect(OKLCH_TO_LMS_COEFFICIENTS.L).toHaveProperty("primary")
    expect(OKLCH_TO_LMS_COEFFICIENTS.L).toHaveProperty("secondary")
  })

  it("LMS_TO_RGB_MATRIX is 3x3", () => {
    expect(LMS_TO_RGB_MATRIX).toHaveLength(3)
    expect(LMS_TO_RGB_MATRIX[0]).toHaveLength(3)
    expect(LMS_TO_RGB_MATRIX[1]).toHaveLength(3)
    expect(LMS_TO_RGB_MATRIX[2]).toHaveLength(3)
  })

  it("RGB_TO_LUMINANCE_WEIGHTS sum to approximately 1", () => {
    const sum =
      RGB_TO_LUMINANCE_WEIGHTS[0] +
      RGB_TO_LUMINANCE_WEIGHTS[1] +
      RGB_TO_LUMINANCE_WEIGHTS[2]
    expect(sum).toBeCloseTo(1, 2)
  })
})
