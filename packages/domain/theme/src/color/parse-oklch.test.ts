import { describe, it, expect } from "vitest"
import { parseOklch, assertOklch, validateOklch } from "./parse-oklch"

describe("parseOklch", () => {
  describe("valid formats", () => {
    it("parses oklch with percentage lightness", () => {
      const result = parseOklch("oklch(50% 0.2 120)")
      expect(result).toEqual({
        l: 0.5,
        c: 0.2,
        h: 120,
      })
    })

    it("parses oklch with decimal lightness", () => {
      const result = parseOklch("oklch(0.5 0.2 120)")
      expect(result).toEqual({
        l: 0.5,
        c: 0.2,
        h: 120,
      })
    })

    it("parses white color", () => {
      const result = parseOklch("oklch(100% 0 0)")
      expect(result).toEqual({
        l: 1,
        c: 0,
        h: 0,
      })
    })

    it("parses black color", () => {
      const result = parseOklch("oklch(0% 0 0)")
      expect(result).toEqual({
        l: 0,
        c: 0,
        h: 0,
      })
    })

    it("parses color with high chroma", () => {
      const result = parseOklch("oklch(50% 0.35 45)")
      expect(result).toEqual({
        l: 0.5,
        c: 0.35,
        h: 45,
      })
    })

    it("parses color with full 360 degree hue", () => {
      const result = parseOklch("oklch(50% 0.2 360)")
      expect(result).toEqual({
        l: 0.5,
        c: 0.2,
        h: 360,
      })
    })

    it("parses color with decimal values", () => {
      const result = parseOklch("oklch(75.5% 0.15 220.5)")
      expect(result).toEqual({
        l: 0.755,
        c: 0.15,
        h: 220.5,
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
      l: 0.5,
      c: 0.2,
      h: 120,
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
  it("returns success for valid format", () => {
    const result = validateOklch("oklch(50% 0.2 120)")
    expect(result.success).toBe(true)
    expect(result.data).toBe("oklch(50% 0.2 120)")
  })

  it("returns error for invalid rgb format", () => {
    const result = validateOklch("rgb(255, 0, 0)")
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it("returns error for invalid format", () => {
    const result = validateOklch("invalid-color")
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it("validates oklch with percentage flag", () => {
    const result = validateOklch("oklch(50% 0.2 120)")
    expect(result.success).toBe(true)
    expect(result.data).toBe("oklch(50% 0.2 120)")
  })

  it("validates oklch without percentage flag", () => {
    const result = validateOklch("oklch(0.5 0.2 120)")
    expect(result.success).toBe(true)
    expect(result.data).toBe("oklch(0.5 0.2 120)")
  })
})
