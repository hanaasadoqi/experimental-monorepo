import { describe, it, expect } from "vitest"
import { luminance, luminanceFromOklch, tryLuminance } from "./luminance"

describe("luminance", () => {
  it("calculates luminance for white", () => {
    const result = luminance("oklch(100% 0 0)")
    expect(result).toBeCloseTo(1, 1)
  })

  it("calculates luminance for black", () => {
    const result = luminance("oklch(0% 0 0)")
    expect(result).toBeCloseTo(0, 1)
  })

  it("calculates luminance for mid-tone gray", () => {
    const result = luminance("oklch(50% 0 0)")
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(1)
  })

  it("matches culori's own luminance() for an out-of-gamut color (regression)", () => {
    // Reference value obtained directly from culori's converter("lrgb")
    // fed through its own wcag.js luminance formula — independent of this
    // package's implementation. oklch(50% 0.35 180) is out of sRGB gamut
    // (real lrgb.r ≈ -0.285); this only matches once transformLMStoRgb
    // stops clamping each channel to [0,1] before weighting.
    const result = luminance("oklch(50% 0.35 180)")
    expect(result).toBeCloseTo(0.15954270099781656, 4)
  })

  it("still matches culori for an in-gamut color", () => {
    const result = luminance("oklch(60% 0.05 180)")
    expect(result).toBeCloseTo(0.22289252216787467, 4)
  })

  it("throws error for invalid oklch format", () => {
    expect(() => luminance("rgb(255, 0, 0)")).toThrow("Invalid OKLch color")
  })

  it("throws error for empty string", () => {
    expect(() => luminance("")).toThrow("Invalid OKLch color")
  })

  it("handles colored oklch values", () => {
    const result = luminance("oklch(50% 0.15 120)")
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(1)
  })

  it("luminance increases with lightness", () => {
    const dark = luminance("oklch(30% 0 0)")
    const medium = luminance("oklch(50% 0 0)")
    const light = luminance("oklch(70% 0 0)")
    expect(dark).toBeLessThan(medium)
    expect(medium).toBeLessThan(light)
  })

  it("handles high chroma colors", () => {
    const result = luminance("oklch(50% 0.3 45)")
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(1)
  })

  it("throws error for malformed oklch", () => {
    expect(() => luminance("oklch(50 0.2)")).toThrow()
  })
})

describe("luminanceFromOklch", () => {
  it("calculates luminance from parsed components", () => {
    const result = luminanceFromOklch({
      lightness: 1,
      chroma: 0,
      hue: 0,
    })
    expect(result).toBeCloseTo(1, 1)
  })

  it("handles black correctly", () => {
    const result = luminanceFromOklch({
      lightness: 0,
      chroma: 0,
      hue: 0,
    })
    expect(result).toBeCloseTo(0, 1)
  })

  it("handles mid-tone gray", () => {
    const result = luminanceFromOklch({
      lightness: 0.5,
      chroma: 0,
      hue: 0,
    })
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(1)
  })

  it("handles colored components", () => {
    const result = luminanceFromOklch({
      lightness: 0.5,
      chroma: 0.2,
      hue: Math.PI / 4,
    })
    expect(typeof result).toBe("number")
    expect(result).toBeGreaterThanOrEqual(0)
  })

  it("is consistent with luminance() for same values", () => {
    const oklchString = "oklch(50% 0.15 120)"
    const parsed = { lightness: 0.5, chroma: 0.15, hue: (120 * Math.PI) / 180 }
    const lum1 = luminance(oklchString)
    const lum2 = luminanceFromOklch(parsed)
    expect(lum1).toBeCloseTo(lum2, 5)
  })

  it("handles full hue range", () => {
    for (let hue = 0; hue < Math.PI * 2; hue += Math.PI / 4) {
      const result = luminanceFromOklch({
        lightness: 0.5,
        chroma: 0.2,
        hue,
      })
      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(1)
    }
  })
})

describe("tryLuminance", () => {
  it("returns luminance for valid oklch", () => {
    const result = tryLuminance("oklch(50% 0.2 120)")
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(1)
  })

  it("returns null for invalid format", () => {
    expect(tryLuminance("rgb(255, 0, 0)")).toBeNull()
  })

  it("returns null for empty string", () => {
    expect(tryLuminance("")).toBeNull()
  })

  it("returns null for malformed oklch", () => {
    expect(tryLuminance("oklch(50% 0.2)")).toBeNull()
  })

  it("returns 1 for white", () => {
    const result = tryLuminance("oklch(100% 0 0)")
    expect(result).toBeCloseTo(1, 1)
  })

  it("returns 0 for black", () => {
    const result = tryLuminance("oklch(0% 0 0)")
    expect(result).toBeCloseTo(0, 1)
  })

  it("returns null for completely invalid input", () => {
    expect(tryLuminance("not a color")).toBeNull()
  })

  it("handles whitespace gracefully", () => {
    // Regular format should work
    const result = tryLuminance("oklch(50% 0.2 120)")
    expect(result).not.toBeNull()
  })

  it("never throws an error", () => {
    const testCases = [
      "rgb(255, 0, 0)",
      "#ff0000",
      "invalid",
      "",
      "oklch()",
      "oklch(50)",
      "oklch(50% 0.2)",
    ]
    for (const testCase of testCases) {
      expect(() => tryLuminance(testCase)).not.toThrow()
    }
  })
})
