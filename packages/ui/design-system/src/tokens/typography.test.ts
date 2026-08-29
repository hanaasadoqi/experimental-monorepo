import { describe, expect, it } from "vitest"

import { typography } from "./typography"

describe("Typography Tokens", () => {
  it("exports typography object with expected structure", () => {
    expect(typography).toBeDefined()
    expect(typography.fontSize).toBeDefined()
    expect(typography.fontWeight).toBeDefined()
    expect(typography.fontFamily).toBeDefined()
    expect(typography.lineHeight).toBeDefined()
    expect(typography.letterSpacing).toBeDefined()
  })

  describe("fontSize", () => {
    it("has standard font size scales (xs to 7xl)", () => {
      expect(typography.fontSize.xs).toBeDefined()
      expect(typography.fontSize.sm).toBeDefined()
      expect(typography.fontSize.base).toBeDefined()
      expect(typography.fontSize.lg).toBeDefined()
      expect(typography.fontSize.xl).toBeDefined()
      expect(typography.fontSize["2xl"]).toBeDefined()
      expect(typography.fontSize["7xl"]).toBeDefined()
    })

    it("fontSize values include both size and line height", () => {
      const xs = typography.fontSize.xs
      expect(Array.isArray(xs)).toBe(true)
      expect(xs).toHaveLength(2)
      expect(typeof xs[0]).toBe("string")
      expect(typeof xs[1]).toBe("object")
    })

    it("font sizes use valid CSS units", () => {
      const sizes = Object.values(typography.fontSize)
      for (const [size] of sizes as Array<[string, unknown]>) {
        expect(/^\d+\.?\d*(rem|px)$/.test(size)).toBe(true)
      }
    })
  })

  describe("fontWeight", () => {
    it("has standard font weights", () => {
      expect(typography.fontWeight.normal).toBe(400)
      expect(typography.fontWeight.medium).toBe(500)
      expect(typography.fontWeight.semibold).toBe(600)
      expect(typography.fontWeight.bold).toBe(700)
    })

    it("all font weights are valid numbers between 100 and 900", () => {
      for (const weight of Object.values(typography.fontWeight)) {
        expect(weight).toBeGreaterThanOrEqual(100)
        expect(weight).toBeLessThanOrEqual(900)
        expect(weight % 100).toBe(0)
      }
    })
  })

  describe("fontFamily", () => {
    it("has sans, serif, and mono families", () => {
      expect(typography.fontFamily.sans).toBeDefined()
      expect(typography.fontFamily.serif).toBeDefined()
      expect(typography.fontFamily.mono).toBeDefined()
    })

    it("font families are arrays of font names", () => {
      expect(Array.isArray(typography.fontFamily.sans)).toBe(true)
      expect(Array.isArray(typography.fontFamily.serif)).toBe(true)
      expect(Array.isArray(typography.fontFamily.mono)).toBe(true)
    })
  })

  describe("lineHeight", () => {
    it("has standard line height values", () => {
      expect(typography.lineHeight.none).toBe(1)
      expect(typography.lineHeight.tight).toBe(1.25)
      expect(typography.lineHeight.normal).toBe(1.5)
      expect(typography.lineHeight.loose).toBe(2)
    })

    it("all line heights are positive numbers", () => {
      for (const height of Object.values(typography.lineHeight)) {
        expect(height).toBeGreaterThan(0)
      }
    })
  })

  describe("letterSpacing", () => {
    it("has standard letter spacing values", () => {
      expect(typography.letterSpacing.tighter).toBeDefined()
      expect(typography.letterSpacing.normal).toBeDefined()
      expect(typography.letterSpacing.wider).toBeDefined()
    })

    it("all letter spacing values use em units", () => {
      for (const spacing of Object.values(typography.letterSpacing)) {
        expect((spacing as string).endsWith("em")).toBe(true)
      }
    })
  })
})
