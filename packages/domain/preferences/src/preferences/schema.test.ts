import { describe, it, expect } from "vitest"
import { preferencesSchema, DEFAULT_PREFERENCES } from "./index"
import type { Preferences } from "./index"

describe("PreferencesSchema", () => {
  describe("valid preferences", () => {
    it("accepts default preferences", () => {
      const result = preferencesSchema.safeParse(DEFAULT_PREFERENCES)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(DEFAULT_PREFERENCES)
      }
    })

    it("accepts all valid appearance values", () => {
      const validAppearances = ["light", "dark", "system"] as const
      for (const appearance of validAppearances) {
        const prefs: Preferences = {
          ...DEFAULT_PREFERENCES,
          appearance,
        }
        const result = preferencesSchema.safeParse(prefs)
        expect(result.success).toBe(true)
      }
    })

    it("accepts all valid language values", () => {
      const validLanguages = [
        "en",
        "es",
        "fr",
        "de",
        "zh",
        "ja",
        "ko",
        "ru",
        "ar",
        "pt",
        "it",
        "nl",
        "sv",
        "no",
        "da",
        "fi",
        "pl",
        "cs",
        "hu",
        "tr",
      ] as const
      for (const language of validLanguages) {
        const prefs: Preferences = {
          ...DEFAULT_PREFERENCES,
          language,
        }
        const result = preferencesSchema.safeParse(prefs)
        expect(result.success).toBe(true)
      }
    })

    it("accepts all valid date format values", () => {
      const validDateFormats = [
        "mm/dd/yyyy",
        "dd/mm/yyyy",
        "yyyy-mm-dd",
      ] as const
      for (const dateFormat of validDateFormats) {
        const prefs: Preferences = {
          ...DEFAULT_PREFERENCES,
          dateFormat,
        }
        const result = preferencesSchema.safeParse(prefs)
        expect(result.success).toBe(true)
      }
    })

    it("accepts all valid time format values", () => {
      const validTimeFormats = ["12h", "24h"] as const
      for (const timeFormat of validTimeFormats) {
        const prefs: Preferences = {
          ...DEFAULT_PREFERENCES,
          timeFormat,
        }
        const result = preferencesSchema.safeParse(prefs)
        expect(result.success).toBe(true)
      }
    })
  })

  describe("invalid preferences", () => {
    it("rejects invalid appearance values", () => {
      const invalidPrefs = {
        ...DEFAULT_PREFERENCES,
        appearance: "invalid-mode",
      }
      const result = preferencesSchema.safeParse(invalidPrefs)
      expect(result.success).toBe(false)
    })

    it("rejects invalid language values", () => {
      const invalidPrefs = {
        ...DEFAULT_PREFERENCES,
        language: "invalid-lang",
      }
      const result = preferencesSchema.safeParse(invalidPrefs)
      expect(result.success).toBe(false)
    })

    it("rejects invalid date format values", () => {
      const invalidPrefs = {
        ...DEFAULT_PREFERENCES,
        dateFormat: "invalid-format",
      }
      const result = preferencesSchema.safeParse(invalidPrefs)
      expect(result.success).toBe(false)
    })

    it("rejects invalid time format values", () => {
      const invalidPrefs = {
        ...DEFAULT_PREFERENCES,
        timeFormat: "invalid-time",
      }
      const result = preferencesSchema.safeParse(invalidPrefs)
      expect(result.success).toBe(false)
    })

    it("rejects null", () => {
      const result = preferencesSchema.safeParse(null)
      expect(result.success).toBe(false)
    })

    it("rejects undefined", () => {
      const result = preferencesSchema.safeParse(undefined)
      expect(result.success).toBe(false)
    })

    it("rejects primitives", () => {
      expect(preferencesSchema.safeParse("string").success).toBe(false)
      expect(preferencesSchema.safeParse(123).success).toBe(false)
      expect(preferencesSchema.safeParse(true).success).toBe(false)
    })

    it("fills in defaults for missing optional fields", () => {
      const partialPrefs = {
        appearance: "light",
        language: "en",
        // missing dateFormat and timeFormat
      }
      const result = preferencesSchema.safeParse(partialPrefs)
      expect(result.success).toBe(true)
      if (result.success) {
        // Zod fills in defaults for missing dateFormat and timeFormat
        expect(result.data.dateFormat).toBe("mm/dd/yyyy")
        expect(result.data.timeFormat).toBe("12h")
      }
    })

    it("rejects arrays", () => {
      expect(preferencesSchema.safeParse([]).success).toBe(false)
    })
  })

  describe("type coercion", () => {
    it("does not coerce types", () => {
      const invalidPrefs = {
        ...DEFAULT_PREFERENCES,
        appearance: 123, // number instead of string
      }
      const result = preferencesSchema.safeParse(invalidPrefs)
      expect(result.success).toBe(false)
    })
  })

  describe("extra fields", () => {
    it("ignores extra fields", () => {
      const prefsWithExtra = {
        ...DEFAULT_PREFERENCES,
        extraField: "should-be-ignored",
      }
      const result = preferencesSchema.safeParse(prefsWithExtra)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(DEFAULT_PREFERENCES)
        expect("extraField" in result.data).toBe(false)
      }
    })
  })
})
