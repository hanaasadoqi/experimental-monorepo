/**
 * Tests for seed data idempotency and structure.
 */

import { describe, it, expect } from "vitest"
import {
  SEED_IDS,
  getDefaultSeedThemes,
  getDefaultLightThemeSeed,
  getDefaultDarkThemeSeed,
  getDefaultSeedPreferences,
  getDefaultSeedUser,
  getDefaultSeedDataset,
} from "./seeds"
import { preferencesSchema } from "@repo/domain-preferences"

describe("Seeds — Idempotency & Structure", () => {
  describe("Seed IDs", () => {
    it("has consistent seed IDs", () => {
      expect(SEED_IDS.LIGHT_THEME).toBe("seed:theme:light")
      expect(SEED_IDS.DARK_THEME).toBe("seed:theme:dark")
      expect(SEED_IDS.DEFAULT_USER).toBe("seed:user:default")
    })
  })

  describe("Theme Seeds", () => {
    it("getDefaultSeedThemes is idempotent", () => {
      const first = getDefaultSeedThemes()
      const second = getDefaultSeedThemes()

      expect(first).toEqual(second)
      expect(first[0]).toEqual(second[0])
      expect(first[1]).toEqual(second[1])
    })

    it("getDefaultSeedThemes returns 3 themes", () => {
      const themes = getDefaultSeedThemes()
      expect(themes).toHaveLength(3)
    })

    it("themes have stable IDs", () => {
      const themes = getDefaultSeedThemes()
      expect(themes[0]!.id).toBe(SEED_IDS.LIGHT_THEME)
      expect(themes[1]!.id).toBe(SEED_IDS.DARK_THEME)
      expect(themes[2]!.id).toBe(SEED_IDS.AUTO_THEME)
    })

    it("light theme has darkMode false", () => {
      const light = getDefaultLightThemeSeed()
      expect(light.darkMode).toBe(false)
      expect(light.id).toBe(SEED_IDS.LIGHT_THEME)
    })

    it("dark theme has darkMode true", () => {
      const dark = getDefaultDarkThemeSeed()
      expect(dark.darkMode).toBe(true)
      expect(dark.id).toBe(SEED_IDS.DARK_THEME)
    })
  })

  describe("Preferences Seeds", () => {
    it("getDefaultSeedPreferences is idempotent", () => {
      const first = getDefaultSeedPreferences()
      const second = getDefaultSeedPreferences()

      expect(first).toEqual(second)
    })

    it("preferences are valid", () => {
      const prefs = getDefaultSeedPreferences()
      const parsed = preferencesSchema.parse(prefs)
      expect(parsed).toEqual(prefs)
    })

    it("default preferences have expected values", () => {
      const prefs = getDefaultSeedPreferences()
      expect(prefs.appearance).toBe("system")
      expect(prefs.language).toBe("en")
      expect(prefs.dateFormat).toBe("mm/dd/yyyy")
      expect(prefs.timeFormat).toBe("12h")
    })
  })

  describe("User Seeds", () => {
    it("getDefaultSeedUser is idempotent", () => {
      const first = getDefaultSeedUser()
      const second = getDefaultSeedUser()

      expect(first).toEqual(second)
    })

    it("user has stable ID", () => {
      const user = getDefaultSeedUser()
      expect(user.id).toBe(SEED_IDS.DEFAULT_USER)
      expect(user.name).toBe("Dev User")
      expect(user.email).toBe("dev@example.com")
    })

    it("user has required fields", () => {
      const user = getDefaultSeedUser()
      expect(user.id).toBeTruthy()
      expect(user.name).toBeTruthy()
      expect(user.email).toBeTruthy()
      expect(user.avatar).toBeTruthy()
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe("Complete Dataset", () => {
    it("getDefaultSeedDataset is idempotent", () => {
      const first = getDefaultSeedDataset()
      const second = getDefaultSeedDataset()

      expect(first).toEqual(second)
    })

    it("dataset contains all required sections", () => {
      const dataset = getDefaultSeedDataset()
      expect(dataset.themes).toBeTruthy()
      expect(dataset.preferences).toBeTruthy()
      expect(dataset.user).toBeTruthy()
    })

    it("dataset themes are valid", () => {
      const dataset = getDefaultSeedDataset()
      expect(dataset.themes).toHaveLength(3)
      dataset.themes.forEach((theme) => {
        expect(theme.id).toBeTruthy()
        expect(typeof theme.enableDarkMode).toBe("boolean")
      })
    })

    it("dataset preferences are valid", () => {
      const dataset = getDefaultSeedDataset()
      const parsed = preferencesSchema.parse(dataset.preferences)
      expect(parsed).toEqual(dataset.preferences)
    })

    it("dataset user is valid", () => {
      const dataset = getDefaultSeedDataset()
      expect(dataset.user.id).toBeTruthy()
      expect(dataset.user.name).toBeTruthy()
      expect(dataset.user.email).toBeTruthy()
    })
  })

  describe("Seeding Philosophy", () => {
    it("seed IDs follow naming convention", () => {
      // All seed IDs should start with "seed:" prefix
      Object.values(SEED_IDS).forEach((id) => {
        expect(id).toMatch(/^seed:/)
      })
    })

    it("seeds never generate random UUIDs", () => {
      // Verify deterministic behavior
      const dataset1 = getDefaultSeedDataset()
      const dataset2 = getDefaultSeedDataset()

      // All IDs should be identical (deterministic)
      expect(dataset1.themes[0]!.id).toBe(dataset2.themes[0]!.id)
      expect(dataset1.user.id).toBe(dataset2.user.id)
    })
  })
})
