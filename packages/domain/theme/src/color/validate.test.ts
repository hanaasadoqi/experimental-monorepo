import { describe, expect, it } from "vitest"
import { validateRgba, isValidHex } from "./validate"
import { hexStrSchema } from "./model"
import { normalizeHex } from "./normalize"

describe("validateRgba (regression: finding #4c)", () => {
  it("rejects NaN channels", () => {
    expect(validateRgba({ r: Number.NaN, g: 0, b: 0 })).toBe(false)
  })

  it("rejects Infinity channels", () => {
    expect(validateRgba({ r: Number.POSITIVE_INFINITY, g: 0, b: 0 })).toBe(
      false
    )
  })

  it("rejects negative channels", () => {
    expect(validateRgba({ r: -5, g: 0, b: 0 })).toBe(false)
  })

  it("rejects channels above 255", () => {
    expect(validateRgba({ r: 300, g: 0, b: 0 })).toBe(false)
  })

  it("rejects alpha outside 0..1", () => {
    expect(validateRgba({ r: 0, g: 0, b: 0, a: 4 })).toBe(false)
    expect(validateRgba({ r: 0, g: 0, b: 0, a: -1 })).toBe(false)
  })

  it("accepts valid in-range values", () => {
    expect(validateRgba({ r: 255, g: 128, b: 0 })).toBe(true)
    expect(validateRgba({ r: 0, g: 0, b: 0, a: 0.5 })).toBe(true)
  })
})

describe("HEX validation/normalization agreement (regression: finding #4d)", () => {
  it("isValidHex agrees with hexStrSchema on the prefixed form", () => {
    expect(isValidHex("#fff")).toBe(true)
    expect(hexStrSchema.safeParse("#fff").success).toBe(true)
    expect(isValidHex("#aabbcc")).toBe(true)
    expect(hexStrSchema.safeParse("#aabbcc").success).toBe(true)
  })

  it("isValidHex agrees with hexStrSchema in rejecting unprefixed hex", () => {
    expect(isValidHex("fff")).toBe(false)
    expect(hexStrSchema.safeParse("fff").success).toBe(false)
  })

  it("isValidHex agrees with hexStrSchema in rejecting 8-digit (alpha) hex", () => {
    expect(isValidHex("#aabbccdd")).toBe(false)
    expect(hexStrSchema.safeParse("#aabbccdd").success).toBe(false)
  })

  it("normalizeHex agrees: rejects unprefixed and 8-digit input", () => {
    expect(normalizeHex("fff")).toBe("#000000")
    expect(normalizeHex("#aabbccdd")).toBe("#000000")
  })

  it("normalizeHex still expands valid 3-digit and passes through 6-digit", () => {
    expect(normalizeHex("#abc")).toBe("#AABBCC")
    expect(normalizeHex("#aabbcc")).toBe("#AABBCC")
  })
})
