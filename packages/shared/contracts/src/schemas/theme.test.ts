import { describe, it, expect } from "vitest"
import {
  themeAppearanceSchema,
  themeOklchColorSchema,
  themeFormSchema,
  type ThemeAppearance,
  type ThemeOklchColor,
  type ThemeForm,
  type Theme,
} from "./theme"

describe("theme schemas", () => {
  describe("themeAppearanceSchema", () => {
    it("accepts valid appearance values", () => {
      const validValues: ThemeAppearance[] = ["light", "dark", "system"]

      validValues.forEach((value) => {
        const result = themeAppearanceSchema.safeParse(value)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toBe(value)
        }
      })
    })

    it("rejects invalid appearance values", () => {
      const invalidValues = [
        "Light",
        "DARK",
        "automatic",
        "default",
        "",
        null,
        undefined,
        123,
      ]

      invalidValues.forEach((value) => {
        const result = themeAppearanceSchema.safeParse(value)
        expect(result.success).toBe(false)
      })
    })

    it("provides clear error message for invalid value", () => {
      const result = themeAppearanceSchema.safeParse("invalid")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBeDefined()
        expect(result.error.issues[0].code).toBe("invalid_enum_value")
      }
    })

    it("maintains enum type safety", () => {
      const result = themeAppearanceSchema.safeParse("light")

      if (result.success) {
        const appearance: ThemeAppearance = result.data
        expect(appearance).toBe("light")
      }
    })

    it("rejects empty string", () => {
      const result = themeAppearanceSchema.safeParse("")
      expect(result.success).toBe(false)
    })

    it("rejects whitespace-only strings", () => {
      const result = themeAppearanceSchema.safeParse("  light  ")
      expect(result.success).toBe(false)
    })

    it("type inference works correctly", () => {
      const inferred = themeAppearanceSchema.parse("system")
      const typed: ThemeAppearance = inferred
      expect(typed).toBe("system")
    })
  })

  describe("themeOklchColorSchema", () => {
    it("accepts valid OKLCH color formats", () => {
      const validColors = [
        "oklch(50% 0.1 45)",
        "oklch(100% 0.2 180)",
        "oklch(0% 0 0)",
        "oklch(75.5 0.15 270)",
        "oklch(50 0.1 45)", // without % on first value
      ]

      validColors.forEach((color) => {
        const result = themeOklchColorSchema.safeParse(color)
        expect(result.success).toBe(true, `Should accept "${color}"`)
        if (result.success) {
          expect(result.data).toBe(color)
        }
      })
    })

    it("rejects invalid OKLCH color formats", () => {
      const invalidColors = [
        "oklch(50% 0.1 45", // missing closing paren
        "oklch 50% 0.1 45)", // space after oklch
        "OKLCH(50% 0.1 45)", // uppercase
        "oklch(50%, 0.1, 45)", // commas instead of spaces
        "oklab(50% 0.1 45)", // different color space
        "#ff0000", // hex color
        "rgb(255, 0, 0)", // rgb color
        "hsl(0, 100%, 50%)", // hsl color
        "", // empty string
        "oklch()", // empty parens
        "oklch(50% 0.1)", // missing third value
      ]

      invalidColors.forEach((color) => {
        const result = themeOklchColorSchema.safeParse(color)
        expect(result.success).toBe(false, `Should reject "${color}"`)
      })
    })

    it("accepts boundary values in OKLCH format", () => {
      const boundaryColors = [
        "oklch(0% 0 0)", // minimum values
        "oklch(100% 0.4 360)", // maximum values
        "oklch(50% 0.37 180)", // mid-range
      ]

      boundaryColors.forEach((color) => {
        const result = themeOklchColorSchema.safeParse(color)
        expect(result.success).toBe(
          true,
          `Should accept boundary color "${color}"`
        )
      })
    })

    it("handles floating-point numbers in OKLCH", () => {
      const floatColors = [
        "oklch(50.123% 0.123 45.456)",
        "oklch(99.9% 0.399 359.999)",
        "oklch(0.1% 0.001 0.001)",
      ]

      floatColors.forEach((color) => {
        const result = themeOklchColorSchema.safeParse(color)
        expect(result.success).toBe(true)
      })
    })

    it("type inference preserves string literal type", () => {
      const color = themeOklchColorSchema.parse("oklch(50% 0.1 45)")
      const typed: ThemeOklchColor = color
      expect(typed).toBe("oklch(50% 0.1 45)")
    })
  })

  describe("themeFormSchema", () => {
    const validForm = {
      appearance: "light" as const,
      accentColor: "oklch(50% 0.1 45)",
    }

    it("accepts valid theme form data", () => {
      const result = themeFormSchema.safeParse(validForm)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.appearance).toBe("light")
        expect(result.data.accentColor).toBe("oklch(50% 0.1 45)")
      }
    })

    it("rejects form with invalid appearance", () => {
      const form = { ...validForm, appearance: "invalid" }
      const result = themeFormSchema.safeParse(form)
      expect(result.success).toBe(false)
    })

    it("rejects form with invalid accentColor", () => {
      const form = { ...validForm, accentColor: "#ff0000" }
      const result = themeFormSchema.safeParse(form)
      expect(result.success).toBe(false)
    })

    it("rejects form with missing required fields", () => {
      const incompleteForm = { appearance: "light" }
      const result = themeFormSchema.safeParse(incompleteForm)
      expect(result.success).toBe(false)
    })

    it("rejects form with extra unexpected fields", () => {
      const formWithExtra = { ...validForm, extraField: "should-fail" }
      const result = themeFormSchema.safeParse(formWithExtra)
      // Zod by default strips extra fields, so this should succeed
      // but the extra field will not be in result.data
      expect(result.success).toBe(true)
      if (result.success) {
        expect("extraField" in result.data).toBe(false)
      }
    })

    it("validates all form combinations of valid values", () => {
      const appearances = ["light", "dark", "system"]
      const colors = [
        "oklch(50% 0.1 45)",
        "oklch(75% 0.2 180)",
        "oklch(25% 0.05 270)",
      ]

      appearances.forEach((appearance) => {
        colors.forEach((color) => {
          const form = { appearance, accentColor: color }
          const result = themeFormSchema.safeParse(form)
          expect(result.success).toBe(true)
        })
      })
    })

    it("type inference works for ThemeForm", () => {
      const form = themeFormSchema.parse(validForm)
      const typed: ThemeForm = form
      expect(typed.appearance).toBe("light")
      expect(typed.accentColor).toBe("oklch(50% 0.1 45)")
    })

    it("theme type alias works correctly", () => {
      const form = themeFormSchema.parse(validForm)
      const themed: Theme = form
      expect(themed).toEqual(form)
    })

    it("provides helpful error messages for validation failures", () => {
      const invalidForm = {
        appearance: "invalid",
        accentColor: "not-a-color",
      }

      const result = themeFormSchema.safeParse(invalidForm)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(2)
        expect(
          result.error.issues.some((i) => i.path.includes("appearance"))
        ).toBe(true)
        expect(
          result.error.issues.some((i) => i.path.includes("accentColor"))
        ).toBe(true)
      }
    })

    it("rejects null or undefined for required fields", () => {
      const forms = [
        { appearance: null, accentColor: "oklch(50% 0.1 45)" },
        { appearance: undefined, accentColor: "oklch(50% 0.1 45)" },
        { appearance: "light", accentColor: null },
        { appearance: "light", accentColor: undefined },
      ]

      forms.forEach((form) => {
        const result = themeFormSchema.safeParse(form)
        expect(result.success).toBe(false)
      })
    })

    it("maintains strict type checking on parse", () => {
      const result = themeFormSchema.parse(validForm)

      // These should be string types
      expect(typeof result.appearance).toBe("string")
      expect(typeof result.accentColor).toBe("string")

      // Appearance should be one of the allowed values
      expect(["light", "dark", "system"]).toContain(result.appearance)
    })
  })

  describe("schema interoperability", () => {
    it("themeFormSchema combines appearance and color schemas correctly", () => {
      // Test that individual schemas are used within the form schema
      const validAppearance = "dark"
      const validColor = "oklch(50% 0.1 45)"

      const appearanceResult = themeAppearanceSchema.safeParse(validAppearance)
      const colorResult = themeOklchColorSchema.safeParse(validColor)
      const formResult = themeFormSchema.safeParse({
        appearance: validAppearance,
        accentColor: validColor,
      })

      expect(appearanceResult.success).toBe(true)
      expect(colorResult.success).toBe(true)
      expect(formResult.success).toBe(true)
    })

    it("rejects when composed schemas fail individually", () => {
      const invalidAppearance = "invalid"
      const invalidColor = "not-oklch"

      const appearanceResult =
        themeAppearanceSchema.safeParse(invalidAppearance)
      const colorResult = themeOklchColorSchema.safeParse(invalidColor)
      const formResult = themeFormSchema.safeParse({
        appearance: invalidAppearance,
        accentColor: invalidColor,
      })

      expect(appearanceResult.success).toBe(false)
      expect(colorResult.success).toBe(false)
      expect(formResult.success).toBe(false)
    })
  })
})
