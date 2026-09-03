import { describe, it, expect } from "vitest"
import { parseOklch, assertOklch, validateOklch } from "./parse"

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

describe("validateOklch (mediator across input shapes)", () => {
  it("accepts a CSS oklch string and reports kind", () => {
    const res = validateOklch("oklch(50% 0.2 120)")
    expect(res.success).toBe(true)
    expect(res.kind).toBe("string")
    expect(res.data).toBe("oklch(50% 0.2 120)")
  })

  it("accepts the persisted {l,c,h} shape", () => {
    const res = validateOklch({ l: 0.5, c: 0.2, h: 250 })
    expect(res.success).toBe(true)
    expect(res.kind).toBe("color")
    expect(res.data).toEqual({ l: 0.5, c: 0.2, h: 250 })
  })

  it("accepts the computation {lightness,chroma,hue} shape", () => {
    const res = validateOklch({ lightness: 0.5, chroma: 0.2, hue: 2.094 })
    expect(res.success).toBe(true)
    expect(res.kind).toBe("components")
  })

  it("keeps the two object shapes unambiguous", () => {
    expect(validateOklch({ l: 0.5, c: 0.2, h: 250 }).kind).toBe("color")
    expect(
      validateOklch({ lightness: 0.5, chroma: 0.2, hue: 2.094 }).kind
    ).toBe("components")
  })

  it("rejects out-of-range channels on the persisted shape", () => {
    expect(validateOklch({ l: 50, c: 0.2, h: 250 }).success).toBe(false)
  })

  it("rejects non-color input", () => {
    expect(validateOklch("rgb(255, 0, 0)").success).toBe(false)
    expect(validateOklch(42).success).toBe(false)
    expect(validateOklch(null).success).toBe(false)
    expect(validateOklch({ nope: 1 }).success).toBe(false)
  })
})
