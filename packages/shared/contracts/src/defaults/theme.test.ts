import { describe, it, expect } from "vitest"
import { OKLCH_REGEX } from "./theme"

describe("OKLCH_REGEX", () => {
  describe("valid OKLCH color formats", () => {
    it("matches basic OKLCH format with percentage", () => {
      const validFormats = [
        "oklch(50% 0.1 45)",
        "oklch(100% 0.2 180)",
        "oklch(0% 0 0)",
        "oklch(25% 0.05 90)",
        "oklch(75% 0.15 270)",
      ]

      validFormats.forEach((format) => {
        expect(OKLCH_REGEX.test(format)).toBe(true)
      })
    })

    it("matches OKLCH format with decimal lightness", () => {
      const formats = [
        "oklch(50.5% 0.1 45)",
        "oklch(99.99% 0.2 180)",
        "oklch(0.1% 0 0)",
        "oklch(33.33% 0.123 45.678)",
      ]

      formats.forEach((format) => {
        expect(OKLCH_REGEX.test(format)).toBe(true)
      })
    })

    it("matches OKLCH format without percentage on first value", () => {
      const formats = [
        "oklch(50 0.1 45)",
        "oklch(100 0.2 180)",
        "oklch(0 0 0)",
        "oklch(75.5 0.15 270)",
      ]

      formats.forEach((format) => {
        expect(OKLCH_REGEX.test(format)).toBe(true)
      })
    })

    it("matches OKLCH with decimal chroma values", () => {
      const formats = [
        "oklch(50% 0.123 45)",
        "oklch(50% 0.001 45)",
        "oklch(50% 0.999 45)",
        "oklch(50% 0.37 180)",
      ]

      formats.forEach((format) => {
        expect(OKLCH_REGEX.test(format)).toBe(true)
      })
    })

    it("matches OKLCH with decimal hue values", () => {
      const formats = [
        "oklch(50% 0.1 45.5)",
        "oklch(50% 0.1 0.1)",
        "oklch(50% 0.1 359.9)",
        "oklch(50% 0.1 180.123)",
      ]

      formats.forEach((format) => {
        expect(OKLCH_REGEX.test(format)).toBe(true)
      })
    })

    it("matches boundary OKLCH values", () => {
      const formats = [
        "oklch(0% 0 0)", // all minimums
        "oklch(100% 0.4 360)", // near maximums
        "oklch(50% 0.37 180)", // mid-range
      ]

      formats.forEach((format) => {
        expect(OKLCH_REGEX.test(format)).toBe(true)
      })
    })

    it("captures OKLCH components correctly", () => {
      const format = "oklch(50% 0.1 45)"
      const match = format.match(OKLCH_REGEX)

      expect(match).not.toBeNull()
      if (match) {
        expect(match[0]).toBe("oklch(50% 0.1 45)") // full match
        expect(match[1]).toBe("50") // lightness value
        expect(match[2]).toBe("%") // percentage sign
        expect(match[3]).toBe("0.1") // chroma value
        expect(match[4]).toBe("45") // hue value
      }
    })

    it("captures OKLCH without percentage sign correctly", () => {
      const format = "oklch(50 0.1 45)"
      const match = format.match(OKLCH_REGEX)

      expect(match).not.toBeNull()
      if (match) {
        expect(match[1]).toBe("50") // lightness value
        expect(match[2]).toBeUndefined() // no percentage sign
        expect(match[3]).toBe("0.1") // chroma value
        expect(match[4]).toBe("45") // hue value
      }
    })
  })

  describe("invalid OKLCH formats - syntax errors", () => {
    it("rejects missing parentheses", () => {
      const formats = [
        "oklch(50% 0.1 45", // missing closing paren
        "oklch 50% 0.1 45)", // missing opening paren
        "oklch50% 0.1 45)", // no parens
      ]

      formats.forEach((format) => {
        expect(OKLCH_REGEX.test(format)).toBe(false)
      })
    })

    it("rejects incorrect function name", () => {
      const formats = [
        "OKLCH(50% 0.1 45)", // uppercase
        "Oklch(50% 0.1 45)", // mixed case
        "oklab(50% 0.1 45)", // different color space
        "oklah(50% 0.1 45)", // typo
        "lch(50% 0.1 45)", // missing ok prefix
      ]

      formats.forEach((format) => {
        expect(OKLCH_REGEX.test(format)).toBe(false)
      })
    })

    it("rejects commas as separators instead of spaces", () => {
      const formats = [
        "oklch(50%, 0.1, 45)",
        "oklch(50% , 0.1 , 45)",
        "oklch(50%,0.1,45)",
      ]

      formats.forEach((format) => {
        expect(OKLCH_REGEX.test(format)).toBe(false)
      })
    })

    it("rejects improper spacing", () => {
      const formats = [
        "oklch( 50% 0.1 45)", // space after paren
        "oklch(50% 0.1 45 )", // space before paren
        "oklch(50%0.1 45)", // no space between values
      ]

      formats.forEach((format) => {
        expect(OKLCH_REGEX.test(format)).toBe(false)
      })
    })

    it("allows multiple spaces between values (greedy whitespace matching)", () => {
      const formats = [
        "oklch(50%  0.1 45)", // double space after %
        "oklch(50% 0.1   45)", // triple space before hue
        "oklch(50%   0.1   45)", // multiple spaces throughout
      ]

      formats.forEach((format) => {
        expect(OKLCH_REGEX.test(format)).toBe(true)
      })
    })

    it("rejects missing values", () => {
      const formats = [
        "oklch(50% 0.1)", // missing hue
        "oklch(50% 45)", // missing chroma
        "oklch(0.1 45)", // missing lightness
        "oklch()", // no values
      ]

      formats.forEach((format) => {
        expect(OKLCH_REGEX.test(format)).toBe(false)
      })
    })
  })

  describe("invalid OKLCH formats - wrong color spaces", () => {
    it("rejects other color space formats", () => {
      const formats = [
        "#ff0000", // hex color
        "rgb(255, 0, 0)", // rgb
        "rgba(255, 0, 0, 1)", // rgba
        "hsl(0, 100%, 50%)", // hsl
        "hsla(0, 100%, 50%, 1)", // hsla
        "hwb(0 0% 0%)", // hwb
        "oklab(50% 0.1 0.1)", // oklab
        "lab(50 0 0)", // lab
        "lch(50 0 0)", // lch
      ]

      formats.forEach((format) => {
        expect(OKLCH_REGEX.test(format)).toBe(false)
      })
    })
  })

  describe("invalid OKLCH formats - edge cases", () => {
    it("rejects empty string and whitespace", () => {
      expect(OKLCH_REGEX.test("")).toBe(false)
      expect(OKLCH_REGEX.test(" ")).toBe(false)
      expect(OKLCH_REGEX.test("\t")).toBe(false)
      expect(OKLCH_REGEX.test("\n")).toBe(false)
    })

    it("rejects strings with leading/trailing content", () => {
      const formats = [
        "color: oklch(50% 0.1 45)", // has prefix
        "oklch(50% 0.1 45);", // has semicolon suffix
        " oklch(50% 0.1 45)", // leading space
        "oklch(50% 0.1 45) ", // trailing space
      ]

      formats.forEach((format) => {
        expect(OKLCH_REGEX.test(format)).toBe(false)
      })
    })

    it("rejects multiple OKLCH values in one string", () => {
      const format = "oklch(50% 0.1 45) oklch(50% 0.1 45)"
      expect(OKLCH_REGEX.test(format)).toBe(false)
    })

    it("rejects strings with special characters", () => {
      const formats = [
        "oklch(50%! 0.1 45)",
        "oklch(50@% 0.1 45)",
        "oklch(50% 0.1$ 45)",
        "oklch(50% 0.1 45#)",
      ]

      formats.forEach((format) => {
        expect(OKLCH_REGEX.test(format)).toBe(false)
      })
    })

    it("is not case-sensitive to lowercase oklch", () => {
      // The regex explicitly looks for lowercase "oklch"
      expect(OKLCH_REGEX.test("OKLCH(50% 0.1 45)")).toBe(false)
      expect(OKLCH_REGEX.test("Oklch(50% 0.1 45)")).toBe(false)
      expect(OKLCH_REGEX.test("oklch(50% 0.1 45)")).toBe(true)
    })
  })

  describe("regex capture groups structure", () => {
    it("has exactly 4 capture groups", () => {
      const format = "oklch(50% 0.1 45)"
      const match = format.match(OKLCH_REGEX)

      expect(match).not.toBeNull()
      if (match) {
        // match[0] is full match, match[1-4] are capture groups
        expect(match.length).toBe(5) // full match + 4 groups
      }
    })

    it("allows optional percentage sign in group 2", () => {
      const withPercent = "oklch(50% 0.1 45)"
      const withoutPercent = "oklch(50 0.1 45)"

      const matchWith = withPercent.match(OKLCH_REGEX)
      const matchWithout = withoutPercent.match(OKLCH_REGEX)

      if (matchWith && matchWithout) {
        expect(matchWith[2]).toBe("%")
        expect(matchWithout[2]).toBeUndefined()
      }
    })

    it("correctly captures all numeric parts", () => {
      const format = "oklch(75.5 0.234 123.45)"
      const match = format.match(OKLCH_REGEX)

      if (match) {
        expect(match[1]).toBe("75.5") // lightness
        expect(match[2]).toBeUndefined() // no percent
        expect(match[3]).toBe("0.234") // chroma
        expect(match[4]).toBe("123.45") // hue
      }
    })
  })

  describe("practical usage scenarios", () => {
    it("validates colors from CSS variables", () => {
      const cssColors = [
        "oklch(var(--lightness) var(--chroma) var(--hue))", // CSS variable syntax fails
        "oklch(50% 0.1 45)", // valid format
      ]

      expect(OKLCH_REGEX.test(cssColors[0] as string)).toBe(false) // variables don't match
      expect(OKLCH_REGEX.test(cssColors[1] as string)).toBe(true) // literal values work
    })

    it("matches theme color definitions", () => {
      const themeColors = [
        "oklch(50% 0.1 45)", // primary
        "oklch(70% 0.08 180)", // secondary
        "oklch(90% 0.05 270)", // tertiary
        "oklch(20% 0.02 0)", // dark
      ]

      themeColors.forEach((color) => {
        expect(OKLCH_REGEX.test(color)).toBe(true)
      })
    })

    it("rejects user input with extra content", () => {
      const userInputs = [
        "color: oklch(50% 0.1 45);", // CSS declaration
        "oklch(50% 0.1 45) !important", // CSS importance
        "oklch(50% 0.1 45) /* comment */", // with comment
      ]

      userInputs.forEach((input) => {
        expect(OKLCH_REGEX.test(input)).toBe(false)
      })
    })
  })
})
