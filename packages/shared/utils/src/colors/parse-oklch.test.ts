import { describe, it, expect } from "vitest"
import { parseOklch, assertOklch, validateOklch } from "./parse-oklch"

describe("parseOklch", () => {
  describe("valid formats", () => {
    it("parses oklch with percentage lightness", () => {
      const result = parseOklch("oklch(50% 0.2 120)")
      expect(result).toEqual({
        lightness: 0.5,
        chroma: 0.2,
        hue: expect.closeTo((120 * Math.PI) / 180, 5),
      })
    })

    it("parses oklch with decimal lightness", () => {
      const result = parseOklch("oklch(0.5 0.2 120)")
      expect(result).toEqual({
        lightness: 0.5,
        chroma: 0.2,
        hue: expect.closeTo((120 * Math.PI) / 180, 5),
      })
    })

    it("parses white color", () => {
      const result = parseOklch("oklch(100% 0 0)")
      expect(result).toEqual({
        lightness: 1,
        chroma: 0,
        hue: 0,
      })
    })

    it("parses black color", () => {
      const result = parseOklch("oklch(0% 0 0)")
      expect(result).toEqual({
        lightness: 0,
        chroma: 0,
        hue: 0,
      })
    })

    it("parses color with high chroma", () => {
      const result = parseOklch("oklch(50% 0.35 45)")
      expect(result).toEqual({
        lightness: 0.5,
        chroma: 0.35,
        hue: expect.closeTo((45 * Math.PI) / 180, 5),
      })
    })

    it("parses color with full 360 degree hue", () => {
      const result = parseOklch("oklch(50% 0.2 360)")
      expect(result).toEqual({
        lightness: 0.5,
        chroma: 0.2,
        hue: expect.closeTo((360 * Math.PI) / 180, 5),
      })
    })

    it("parses color with decimal values", () => {
      const result = parseOklch("oklch(75.5% 0.15 220.5)")
      expect(result).toEqual({
        lightness: 0.755,
        chroma: 0.15,
        hue: expect.closeTo((220.5 * Math.PI) / 180, 5),
      })
    })
  })

  describe("invalid formats", () => {
    it("returns null for empty string", () => {
      expect(parseOklch("")).toBeNull()
    })

    it("returns null for rgb format", () => {
      expect(parseOklch("rgb(255, 0, 0)")).toBeNull()
    })

    it("returns null for hex format", () => {
      expect(parseOklch("#ff0000")).toBeNull()
    })

    it("returns null for malformed oklch missing values", () => {
      expect(parseOklch("oklch(50%)")).toBeNull()
    })

    it("returns null for oklch with extra characters", () => {
      expect(parseOklch("oklch(50% 0.2 120px)")).toBeNull()
    })

    it("returns null for oklch with wrong parameter order", () => {
      expect(parseOklch("oklch(0.2 50% 120)")).toBeNull()
    })

    it("returns null for text without oklch prefix", () => {
      expect(parseOklch("50% 0.2 120")).toBeNull()
    })
  })
})

describe("assertOklch", () => {
  it("returns parsed color for valid input", () => {
    const result = assertOklch("oklch(50% 0.2 120)")
    expect(result).toEqual({
      lightness: 0.5,
      chroma: 0.2,
      hue: expect.closeTo((120 * Math.PI) / 180, 5),
    })
  })

  it("throws error for invalid format", () => {
    expect(() => assertOklch("rgb(255, 0, 0)")).toThrow("Invalid OKLch color")
  })

  it("throws error for empty string", () => {
    expect(() => assertOklch("")).toThrow("Invalid OKLch color")
  })

  it("throws error message includes format hint", () => {
    expect(() => assertOklch("invalid")).toThrow(
      "Expected format: oklch(L C H) or oklch(L% C H)"
    )
  })

  it("throws error for malformed oklch", () => {
    expect(() => assertOklch("oklch(50 0.2)")).toThrow("Invalid OKLch color")
  })
})

describe("validateOklch", () => {
  it("returns match array for valid format", () => {
    const result = validateOklch("oklch(50% 0.2 120)")
    expect(result).toBeDefined()
    expect(result?.[1]).toBe("50")
    expect(result?.[3]).toBe("0.2")
    expect(result?.[4]).toBe("120")
  })

  it("throws error for invalid format", () => {
    expect(() => validateOklch("rgb(255, 0, 0)")).toThrow("Unsupported color")
  })

  it("throws error includes original value", () => {
    const color = "invalid-color"
    expect(() => validateOklch(color)).toThrow(`Unsupported color: ${color}`)
  })

  it("returns match with percentage flag", () => {
    const result = validateOklch("oklch(50% 0.2 120)")
    expect(result?.[2]).toBe("%")
  })

  it("returns match without percentage flag", () => {
    const result = validateOklch("oklch(0.5 0.2 120)")
    expect(result?.[2]).toBeUndefined()
  })
})
