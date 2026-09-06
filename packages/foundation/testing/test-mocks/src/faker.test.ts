/**
 * Validation tests for faker factories.
 * Ensures factories always produce valid data matching domain schemas.
 */

import { describe, it, expect } from "vitest"
import {
  createFakeTheme,
  createFakeThemes,
  createFakeAppearancePreference,
  createFakeLanguagePreference,
  createFakeDateFormatPreference,
  createFakeTimeFormatPreference,
  createFakePreferences,
  createFakePreferencesBatch,
  createFakeUser,
  createFakeUsers,
} from "./faker"
import {
  appearancePreferenceSchema,
  preferencesSchema,
  APPEARANCE_OPTIONS,
  LANGUAGE_PREFERENCE_OPTIONS,
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS,
} from "@repo/domain-preferences"

describe("Faker Factories — Schema Validation", () => {
  describe("Theme Factory", () => {
    it("createFakeTheme produces valid themes", () => {
      for (let i = 0; i < 50; i++) {
        const theme = createFakeTheme()
        expect(theme.id).toBeTruthy()
        expect(typeof theme.enableDarkMode).toBe("boolean")
        expect(
          theme.isDarkMode === undefined ||
            typeof theme.isDarkMode === "boolean"
        ).toBe(true)
        expect(Array.isArray(theme.scopeIds)).toBe(true)
      }
    })

    it("createFakeTheme with overrides preserves validity", () => {
      const theme = createFakeTheme({ id: "custom-id", isDarkMode: true })
      expect(theme.id).toBe("custom-id")
      expect(theme.isDarkMode).toBe(true)
    })

    it("createFakeThemes produces array of valid themes", () => {
      const themes = createFakeThemes(5)
      expect(themes).toHaveLength(5)
      themes.forEach((theme) => {
        expect(theme.id).toBeTruthy()
        expect(typeof theme.enableDarkMode).toBe("boolean")
      })
    })
  })

  describe("Preferences Factories", () => {
    it("createFakeAppearancePreference produces valid values", () => {
      for (let i = 0; i < 50; i++) {
        const pref = createFakeAppearancePreference()
        expect(APPEARANCE_OPTIONS).toContain(pref)
        // Should also validate with schema
        const parsed = appearancePreferenceSchema.parse(pref)
        expect(parsed).toBe(pref)
      }
    })

    it("createFakeAppearancePreference with override", () => {
      const pref = createFakeAppearancePreference("dark")
      expect(pref).toBe("dark")
    })

    it("createFakeLanguagePreference produces valid values", () => {
      for (let i = 0; i < 50; i++) {
        const pref = createFakeLanguagePreference()
        expect(LANGUAGE_PREFERENCE_OPTIONS).toContain(pref)
      }
    })

    it("createFakeDateFormatPreference produces valid values", () => {
      for (let i = 0; i < 50; i++) {
        const pref = createFakeDateFormatPreference()
        expect(DATE_FORMAT_OPTIONS).toContain(pref)
      }
    })

    it("createFakeTimeFormatPreference produces valid values", () => {
      for (let i = 0; i < 50; i++) {
        const pref = createFakeTimeFormatPreference()
        expect(TIME_FORMAT_OPTIONS).toContain(pref)
      }
    })

    it("createFakePreferences produces valid complete preferences", () => {
      for (let i = 0; i < 50; i++) {
        const prefs = createFakePreferences()
        // Should validate against full schema
        const parsed = preferencesSchema.parse(prefs)
        expect(parsed).toEqual(prefs)
        // Check each field
        expect(APPEARANCE_OPTIONS).toContain(prefs.appearance)
        expect(LANGUAGE_PREFERENCE_OPTIONS).toContain(prefs.language)
        expect(DATE_FORMAT_OPTIONS).toContain(prefs.dateFormat)
        expect(TIME_FORMAT_OPTIONS).toContain(prefs.timeFormat)
      }
    })

    it("createFakePreferences with overrides preserves validity", () => {
      const prefs = createFakePreferences({
        appearance: "dark",
        language: "es",
      })
      expect(prefs.appearance).toBe("dark")
      expect(prefs.language).toBe("es")
      // Should still be valid
      const parsed = preferencesSchema.parse(prefs)
      expect(parsed).toEqual(prefs)
    })

    it("createFakePreferencesBatch produces valid array", () => {
      const batch = createFakePreferencesBatch(10)
      expect(batch).toHaveLength(10)
      batch.forEach((prefs) => {
        const parsed = preferencesSchema.parse(prefs)
        expect(parsed).toEqual(prefs)
      })
    })
  })

  describe("User Factory", () => {
    it("createFakeUser produces valid users", () => {
      for (let i = 0; i < 20; i++) {
        const user = createFakeUser()
        expect(user.id).toBeTruthy()
        expect(user.name).toBeTruthy()
        expect(user.email).toBeTruthy()
        expect(user.avatar).toBeTruthy()
        expect(user.createdAt).toBeInstanceOf(Date)
        expect(user.updatedAt).toBeInstanceOf(Date)
      }
    })

    it("createFakeUser with overrides", () => {
      const user = createFakeUser({
        id: "custom-user-id",
        name: "Custom Name",
      })
      expect(user.id).toBe("custom-user-id")
      expect(user.name).toBe("Custom Name")
      expect(user.email).toBeTruthy()
    })

    it("createFakeUsers produces valid array", () => {
      const users = createFakeUsers(10)
      expect(users).toHaveLength(10)
      users.forEach((user) => {
        expect(user.id).toBeTruthy()
        expect(user.name).toBeTruthy()
      })
    })

    it("updatedAt is always after or equal to createdAt", () => {
      for (let i = 0; i < 20; i++) {
        const user = createFakeUser()
        expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
          user.createdAt.getTime()
        )
      }
    })
  })

  describe("Edge Cases & Error Handling", () => {
    it("rejects invalid overrides", () => {
      expect(() => {
        createFakePreferences({
          // Intentionally pass invalid value to test validation
          appearance:
            "invalid-appearance" as unknown as (typeof APPEARANCE_OPTIONS)[number],
        })
      }).toThrow()
    })

    it("theme with empty scopeIds is still valid", () => {
      const theme = createFakeTheme({ scopeIds: [] })
      expect(Array.isArray(theme.scopeIds)).toBe(true)
    })

    it("batch operations scale efficiently", () => {
      const start = performance.now()
      const batch = createFakePreferencesBatch(1000)
      const end = performance.now()

      expect(batch).toHaveLength(1000)
      expect(end - start).toBeLessThan(5000) // Should complete in < 5s
    })
  })
})
