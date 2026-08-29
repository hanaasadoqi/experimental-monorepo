import { describe, it, expect } from "vitest"
import {
  parseOklch,
  assertOklch,
  validateOklch,
  transformOklchToLMS,
  transformLMStoRgb,
  calculateLuminanceFromRgb,
  luminance,
  luminanceFromOklch,
  tryLuminance,
  contrastRatio,
  calculateContrastRatio,
  meetsContrastRequirement,
  CONTRAST_THRESHOLDS,
  OKLCH_TO_LMS_COEFFICIENTS,
  LMS_TO_RGB_MATRIX,
  RGB_TO_LUMINANCE_WEIGHTS,
} from "./index"

describe("colors barrel export", () => {
  it("exports parseOklch", () => {
    expect(parseOklch).toBeDefined()
    expect(typeof parseOklch).toBe("function")
  })

  it("exports assertOklch", () => {
    expect(assertOklch).toBeDefined()
    expect(typeof assertOklch).toBe("function")
  })

  it("exports validateOklch", () => {
    expect(validateOklch).toBeDefined()
    expect(typeof validateOklch).toBe("function")
  })

  it("exports transformOklchToLMS", () => {
    expect(transformOklchToLMS).toBeDefined()
    expect(typeof transformOklchToLMS).toBe("function")
  })

  it("exports transformLMStoRgb", () => {
    expect(transformLMStoRgb).toBeDefined()
    expect(typeof transformLMStoRgb).toBe("function")
  })

  it("exports calculateLuminanceFromRgb", () => {
    expect(calculateLuminanceFromRgb).toBeDefined()
    expect(typeof calculateLuminanceFromRgb).toBe("function")
  })

  it("exports luminance", () => {
    expect(luminance).toBeDefined()
    expect(typeof luminance).toBe("function")
  })

  it("exports luminanceFromOklch", () => {
    expect(luminanceFromOklch).toBeDefined()
    expect(typeof luminanceFromOklch).toBe("function")
  })

  it("exports tryLuminance", () => {
    expect(tryLuminance).toBeDefined()
    expect(typeof tryLuminance).toBe("function")
  })

  it("exports contrastRatio", () => {
    expect(contrastRatio).toBeDefined()
    expect(typeof contrastRatio).toBe("function")
  })

  it("exports calculateContrastRatio", () => {
    expect(calculateContrastRatio).toBeDefined()
    expect(typeof calculateContrastRatio).toBe("function")
  })

  it("exports meetsContrastRequirement", () => {
    expect(meetsContrastRequirement).toBeDefined()
    expect(typeof meetsContrastRequirement).toBe("function")
  })

  it("exports CONTRAST_THRESHOLDS constant", () => {
    expect(CONTRAST_THRESHOLDS).toBeDefined()
    expect(CONTRAST_THRESHOLDS.AA_NORMAL).toBe(4.5)
  })

  it("exports transformation coefficients", () => {
    expect(OKLCH_TO_LMS_COEFFICIENTS).toBeDefined()
    expect(LMS_TO_RGB_MATRIX).toBeDefined()
    expect(RGB_TO_LUMINANCE_WEIGHTS).toBeDefined()
  })

  it("can compose color pipeline", () => {
    // Parse → Transform → Calculate → Check Contrast
    const color1 = assertOklch("oklch(20% 0 0)")
    const color2 = assertOklch("oklch(100% 0 0)")

    const lms1 = transformOklchToLMS(color1)
    const lms2 = transformOklchToLMS(color2)

    const rgb1 = transformLMStoRgb(lms1)
    const rgb2 = transformLMStoRgb(lms2)

    const lum1 = calculateLuminanceFromRgb(rgb1)
    const lum2 = calculateLuminanceFromRgb(rgb2)

    const ratio = calculateContrastRatio(lum1, lum2)

    expect(ratio).toBeGreaterThan(15)
  })
})
