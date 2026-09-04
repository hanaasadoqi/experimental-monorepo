import { describe, expect, it } from "vitest"
import {
  calculateContrastRatio,
  contrastRatio,
  meetsContrastRequirement,
} from "./accessibility"
import { parseOklch } from "./parse"
import { luminance, luminanceFromOklch, tryLuminance } from "./luminance"
import { CONTRAST_THRESHOLDS } from "./constants"
import { assertOklch } from "./parse"
import {
  LMS_TO_RGB_MATRIX,
  OKLCH_TO_LMS_COEFFICIENTS,
  RGB_TO_LUMINANCE_WEIGHTS,
  calculateLuminanceFromRgb,
  transformLMStoRgb,
  transformOklchToLMS,
} from "./transforms"

describe("colors barrel export", () => {
  it("exports this package's own parseOklch (regression: finding #8)", () => {
    // Was previously imported from "culori" directly, so this only ever
    // verified culori's own export existed. This package's `parseOklch` is
    // an alias for `parseOklchStringToComponents` — its distinguishing
    // feature is returning {lightness,chroma,hue} with hue in RADIANS, a
    // shape culori's own (degrees, {mode,l,c,h}) parseOklch does not produce.
    expect(parseOklch).toBeDefined()
    expect(typeof parseOklch).toBe("function")
    const result = parseOklch("oklch(50% 0.2 180)")
    expect(result).toEqual({
      lightness: 0.5,
      chroma: 0.2,
      hue: expect.closeTo(Math.PI, 5),
    })
  })

  it("exports assertOklch", () => {
    expect(assertOklch).toBeDefined()
    expect(typeof assertOklch).toBe("function")
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
