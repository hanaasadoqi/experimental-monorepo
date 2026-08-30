import { describe, it, expect } from "vitest"
import { themeFormSchema, type ThemeForm } from "./theme.js"
import { type AppearancePreference } from "./preferences.js"
import { type OklchStr } from "./colors.js"

describe("theme schemas", () => {
  describe("themeFormSchema", () => {
    const validForm: ThemeForm = {
      appearance: "light",
      primaryColor: "oklch(50% 0.1 45)",
    }

    it("accepts valid theme form with light appearance", () => {
      const result = themeFormSchema.safeParse({
        appearance: "light",
        primaryColor: "oklch(65% 0.15 250)",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.appearance).toBe("light")
        expect(result.data.primaryColor).toBe("oklch(65% 0.15 250)")
      }
    })

    it("accepts valid theme form with dark appearance", () => {
      const result = themeFormSchema.safeParse({
        appearance: "dark",
        primaryColor: "oklch(50% 0.2 180)",
      })
      expect(result.success).toBe(true)
    })

    it("accepts valid theme form with system appearance", () => {
      const result = themeFormSchema.safeParse({
        appearance: "system",
        primaryColor: "oklch(70% 0.12 120)",
      })
      expect(result.success).toBe(true)
    })

    it("rejects invalid appearance value", () => {
      const result = themeFormSchema.safeParse({
        appearance: "invalid",
        primaryColor: "oklch(50% 0.1 45)",
      })
      expect(result.success).toBe(false)
    })

    it("rejects invalid oklch color format", () => {
      const invalidColors = [
        "#ff0000",
        "rgb(255, 0, 0)",
        "hsl(0, 100%, 50%)",
        "oklch(50% 0.1 45",
        "oklch(50%, 0.1, 45)",
        "oklch()",
      ]

      invalidColors.forEach((color) => {
        const result = themeFormSchema.safeParse({
          appearance: "light",
          primaryColor: color,
        })
        expect(result.success).toBe(false)
      })
    })

    it("rejects missing required fields", () => {
      const incompleteForm1 = { primaryColor: "oklch(50% 0.1 45)" }
      const incompleteForm2 = { appearance: "light" }

      expect(themeFormSchema.safeParse(incompleteForm1).success).toBe(false)
      expect(themeFormSchema.safeParse(incompleteForm2).success).toBe(false)
    })

    it("rejects null or undefined values", () => {
      const forms = [
        { appearance: null, primaryColor: "oklch(50% 0.1 45)" },
        { appearance: "light", primaryColor: null },
      ]

      forms.forEach((form) => {
        expect(themeFormSchema.safeParse(form).success).toBe(false)
      })
    })

    it("strips extra fields but maintains data integrity", () => {
      const result = themeFormSchema.safeParse({
        appearance: "light",
        primaryColor: "oklch(50% 0.1 45)",
        extraField: "should-be-stripped",
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(Object.keys(result.data).sort()).toEqual([
          "appearance",
          "primaryColor",
        ])
      }
    })

    it("type inference maintains strictness", () => {
      const form = themeFormSchema.parse(validForm)
      const typed: ThemeForm = form
      expect(typeof typed.appearance).toBe("string")
      expect(typeof typed.primaryColor).toBe("string")
    })

    it("validates all valid appearance × primaryColor combinations", () => {
      const appearances: AppearancePreference[] = ["light", "dark", "system"]
      const colors: OklchStr[] = [
        "oklch(50% 0.1 45)",
        "oklch(75% 0.2 180)",
        "oklch(25% 0.05 270)",
      ]

      let validCount = 0
      appearances.forEach((appearance) => {
        colors.forEach((color) => {
          const result = themeFormSchema.safeParse({
            appearance,
            primaryColor: color,
          })
          if (result.success) validCount++
        })
      })

      expect(validCount).toBe(9)
    })

    it("provides meaningful error information", () => {
      const result = themeFormSchema.safeParse({
        appearance: "invalid",
        primaryColor: "invalid-color",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })

    it("roundtrips through parse and reparse", () => {
      const original: ThemeForm = {
        appearance: "dark",
        primaryColor: "oklch(55% 0.2 180)",
      }

      const parsed = themeFormSchema.parse(original)
      const reparsed = themeFormSchema.parse(parsed)

      expect(reparsed.appearance).toBe(original.appearance)
      expect(reparsed.primaryColor).toBe(original.primaryColor)
    })
  })
})
