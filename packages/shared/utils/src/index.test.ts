import { describe, it, expect } from "vitest"
import {
  cn,
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
  readCookie,
} from "./index"

describe("shared-utils main barrel export", () => {
  describe("classnames export", () => {
    it("exports cn function", () => {
      expect(cn).toBeDefined()
      expect(typeof cn).toBe("function")
    })

    it("cn works correctly", () => {
      const result = cn("px-2", "py-1")
      expect(result).toContain("px-2")
      expect(result).toContain("py-1")
    })
  })

  describe("color utilities exports", () => {
    it("exports parseOklch", () => {
      expect(parseOklch).toBeDefined()
    })

    it("exports assertOklch", () => {
      expect(assertOklch).toBeDefined()
    })

    it("exports validateOklch", () => {
      expect(validateOklch).toBeDefined()
    })

    it("exports transformOklchToLMS", () => {
      expect(transformOklchToLMS).toBeDefined()
    })

    it("exports transformLMStoRgb", () => {
      expect(transformLMStoRgb).toBeDefined()
    })

    it("exports calculateLuminanceFromRgb", () => {
      expect(calculateLuminanceFromRgb).toBeDefined()
    })

    it("exports luminance", () => {
      expect(luminance).toBeDefined()
    })

    it("exports luminanceFromOklch", () => {
      expect(luminanceFromOklch).toBeDefined()
    })

    it("exports tryLuminance", () => {
      expect(tryLuminance).toBeDefined()
    })

    it("exports contrastRatio", () => {
      expect(contrastRatio).toBeDefined()
    })

    it("exports calculateContrastRatio", () => {
      expect(calculateContrastRatio).toBeDefined()
    })

    it("exports meetsContrastRequirement", () => {
      expect(meetsContrastRequirement).toBeDefined()
    })

    it("exports CONTRAST_THRESHOLDS", () => {
      expect(CONTRAST_THRESHOLDS).toBeDefined()
    })

    it("color utilities are functional", () => {
      const result = luminance("oklch(50% 0 0)")
      expect(typeof result).toBe("number")
    })
  })

  describe("server utilities exports", () => {
    it("exports readCookie function", () => {
      expect(readCookie).toBeDefined()
      expect(typeof readCookie).toBe("function")
    })

    it("readCookie is async", () => {
      expect(readCookie.constructor.name).toBe("AsyncFunction")
    })
  })

  describe("cross-module functionality", () => {
    it("can use cn with color utilities", () => {
      const classes = cn("px-2", "text-white", "bg-blue-500")
      expect(classes).toBeDefined()
      expect(typeof classes).toBe("string")
    })

    it("can compose complete color workflow", () => {
      const parsed = parseOklch("oklch(50% 0.2 120)")
      expect(parsed).not.toBeNull()

      if (parsed) {
        const lms = transformOklchToLMS(parsed)
        const rgb = transformLMStoRgb(lms)
        const lum = calculateLuminanceFromRgb(rgb)
        expect(lum).toBeGreaterThan(0)
      }
    })
  })
})
