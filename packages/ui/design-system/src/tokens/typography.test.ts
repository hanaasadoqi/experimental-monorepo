import { describe, expect, it } from "vitest"

import { typography } from "./typography"

describe("Typography Tokens", () => {
  it("exports typography object with expected structure and default values", () => {
    expect(typography).toBeDefined()
    expect(typography.DEFAULT).toBeDefined()
    expect(typography.DEFAULT.fontSize).toBeDefined()
    expect(typography.DEFAULT.fontSize.lineHeight).toBeDefined()
    expect(typography.DEFAULT.fontSize.letterSpacing).toBeDefined()
    expect(typography.DEFAULT.fontFamily).toBeDefined()
    expect(typography.DEFAULT.fontFamily.mono).toBeDefined()
    expect(typography.DEFAULT.fontFamily.sans).toBeDefined()
    expect(typography.DEFAULT.fontFamily.serif).toBeDefined()
  })

  // describe("fontSize", () => {

  // })

  describe("fontFamily", () => {
    it("has sans, serif, and mono families", () => {
      expect(typography.DEFAULT.fontFamily.sans).toBeDefined()
      expect(typography.DEFAULT.fontFamily.serif).toBeDefined()
      expect(typography.DEFAULT.fontFamily.mono).toBeDefined()
    })

    it("font families are arrays of font names", () => {
      expect(Array.isArray(typography.DEFAULT.fontFamily.sans)).toBe(false)
      expect(typeof (typography.DEFAULT.fontFamily.serif) === "string").toBe(true)
      expect(Array.isArray(typography.DEFAULT.fontFamily.mono)).toBe(false)
    })
  })

  describe("lineHeight", () => {
    it("has standard line height value as default", () => {
      expect(typography.DEFAULT.fontSize.lineHeight).toBe(1.5)
    })
  })

  // describe("letterSpacing", () => {

  // })
})
