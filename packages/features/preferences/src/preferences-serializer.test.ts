import { describe, expect, it } from "vitest"
import { DEFAULT_PREFERENCES, type Preferences } from "@repo/domain-preferences"
import {
  PreferencesSerializer,
  type PreferencesSnapshot,
} from "./preferences-serializer"

describe("PreferencesSerializer", () => {
  describe("createSnapshot", () => {
    it("creates a snapshot with current version and timestamp", () => {
      const snapshot = PreferencesSerializer.createSnapshot(DEFAULT_PREFERENCES)

      expect(snapshot).toMatchObject({
        version: "1.0",
        preferences: DEFAULT_PREFERENCES,
      })
      expect(snapshot.timestamp).toBeGreaterThan(0)
      expect(typeof snapshot.timestamp).toBe("number")
    })

    it("includes provided preferences exactly as given", () => {
      const customPrefs: Preferences = {
        appearance: "dark",
        language: "fr",
        dateFormat: "dd/mm/yyyy",
        timeFormat: "24h",
      }

      const snapshot = PreferencesSerializer.createSnapshot(customPrefs)

      expect(snapshot.preferences).toEqual(customPrefs)
    })
  })

  describe("roundtrip: createSnapshot → restoreFromSnapshot", () => {
    it("restores default preferences unchanged", () => {
      const snapshot = PreferencesSerializer.createSnapshot(DEFAULT_PREFERENCES)
      const result = PreferencesSerializer.restoreFromSnapshot(snapshot)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(DEFAULT_PREFERENCES)
    })

    it("restores custom preferences unchanged", () => {
      const custom: Preferences = {
        appearance: "light",
        language: "de",
        dateFormat: "yyyy-mm-dd",
        timeFormat: "12h",
      }

      const snapshot = PreferencesSerializer.createSnapshot(custom)
      const result = PreferencesSerializer.restoreFromSnapshot(snapshot)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(custom)
    })

    it("restores all appearance preferences", () => {
      const appearances: Array<Preferences["appearance"]> = [
        "light",
        "dark",
        "system",
      ]

      for (const appearance of appearances) {
        const prefs: Preferences = {
          ...DEFAULT_PREFERENCES,
          appearance,
        }

        const snapshot = PreferencesSerializer.createSnapshot(prefs)
        const result = PreferencesSerializer.restoreFromSnapshot(snapshot)

        expect(result.success).toBe(true)
        expect(result.data?.appearance).toBe(appearance)
      }
    })

    it("restores all language preferences", () => {
      const languages: Array<Preferences["language"]> = [
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
      ]

      for (const language of languages) {
        const prefs: Preferences = {
          ...DEFAULT_PREFERENCES,
          language,
        }

        const snapshot = PreferencesSerializer.createSnapshot(prefs)
        const result = PreferencesSerializer.restoreFromSnapshot(snapshot)

        expect(result.success).toBe(true)
        expect(result.data?.language).toBe(language)
      }
    })

    it("restores all date format preferences", () => {
      const dateFormats: Array<Preferences["dateFormat"]> = [
        "mm/dd/yyyy",
        "dd/mm/yyyy",
        "yyyy-mm-dd",
      ]

      for (const dateFormat of dateFormats) {
        const prefs: Preferences = {
          ...DEFAULT_PREFERENCES,
          dateFormat,
        }

        const snapshot = PreferencesSerializer.createSnapshot(prefs)
        const result = PreferencesSerializer.restoreFromSnapshot(snapshot)

        expect(result.success).toBe(true)
        expect(result.data?.dateFormat).toBe(dateFormat)
      }
    })

    it("restores all time format preferences", () => {
      const timeFormats: Array<Preferences["timeFormat"]> = ["12h", "24h"]

      for (const timeFormat of timeFormats) {
        const prefs: Preferences = {
          ...DEFAULT_PREFERENCES,
          timeFormat,
        }

        const snapshot = PreferencesSerializer.createSnapshot(prefs)
        const result = PreferencesSerializer.restoreFromSnapshot(snapshot)

        expect(result.success).toBe(true)
        expect(result.data?.timeFormat).toBe(timeFormat)
      }
    })
  })

  describe("roundtrip: toJSON → fromJSON", () => {
    it("restores preferences from JSON roundtrip", () => {
      const json = PreferencesSerializer.toJSON(DEFAULT_PREFERENCES)
      const result = PreferencesSerializer.fromJSON(json)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(DEFAULT_PREFERENCES)
    })

    it("produces valid JSON string", () => {
      const json = PreferencesSerializer.toJSON(DEFAULT_PREFERENCES)

      expect(typeof json).toBe("string")
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it("includes metadata in JSON snapshot", () => {
      const json = PreferencesSerializer.toJSON(DEFAULT_PREFERENCES)
      const snapshot = JSON.parse(json) as PreferencesSnapshot

      expect(snapshot.version).toBe("1.0")
      expect(snapshot.timestamp).toBeGreaterThan(0)
      expect(snapshot.preferences).toEqual(DEFAULT_PREFERENCES)
    })

    it("produces formatted (pretty-printed) JSON", () => {
      const json = PreferencesSerializer.toJSON(DEFAULT_PREFERENCES)

      // Pretty-printed JSON should contain newlines and indentation
      expect(json).toContain("\n")
      expect(json).toContain("  ")
    })

    it("roundtrips complex preferences through JSON", () => {
      const custom: Preferences = {
        appearance: "dark",
        language: "ja",
        dateFormat: "yyyy-mm-dd",
        timeFormat: "24h",
      }

      const json = PreferencesSerializer.toJSON(custom)
      const result = PreferencesSerializer.fromJSON(json)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(custom)
    })
  })

  describe("invalid snapshots", () => {
    it("rejects null snapshot", () => {
      const result = PreferencesSerializer.restoreFromSnapshot(null)
      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
    })

    it("rejects undefined snapshot", () => {
      const result = PreferencesSerializer.restoreFromSnapshot(undefined)
      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
    })

    it("rejects primitive values", () => {
      const r1 = PreferencesSerializer.restoreFromSnapshot("string")
      const r2 = PreferencesSerializer.restoreFromSnapshot(123)
      const r3 = PreferencesSerializer.restoreFromSnapshot(true)
      expect(r1.success).toBe(false)
      expect(r2.success).toBe(false)
      expect(r3.success).toBe(false)
    })

    it("rejects snapshot without version", () => {
      const invalid = {
        timestamp: Date.now(),
        preferences: DEFAULT_PREFERENCES,
      }

      const result = PreferencesSerializer.restoreFromSnapshot(invalid)
      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
    })

    it("rejects snapshot with non-string version", () => {
      const invalid = {
        version: 1.0,
        timestamp: Date.now(),
        preferences: DEFAULT_PREFERENCES,
      }

      const result = PreferencesSerializer.restoreFromSnapshot(invalid)
      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
    })

    it("rejects snapshot with unsupported version", () => {
      const unsupported = {
        version: "2.0",
        timestamp: Date.now(),
        preferences: DEFAULT_PREFERENCES,
      }

      const result = PreferencesSerializer.restoreFromSnapshot(unsupported)
      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
    })

    it("rejects snapshot without preferences field", () => {
      const invalid = {
        version: "1.0",
        timestamp: Date.now(),
      }

      const result = PreferencesSerializer.restoreFromSnapshot(invalid)
      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
    })

    it("rejects snapshot with non-object preferences", () => {
      const invalid = {
        version: "1.0",
        timestamp: Date.now(),
        preferences: "not an object",
      }

      const result = PreferencesSerializer.restoreFromSnapshot(invalid)
      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
    })

    it("rejects snapshot with invalid preference values", () => {
      const invalid = {
        version: "1.0",
        timestamp: Date.now(),
        preferences: {
          appearance: "invalid-value",
          language: "en",
        },
      }

      const result = PreferencesSerializer.restoreFromSnapshot(invalid)
      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
    })

    it("fills in defaults for missing preference fields", () => {
      const incomplete = {
        version: "1.0",
        timestamp: Date.now(),
        preferences: {
          appearance: "light",
          language: "en",
          // Missing dateFormat and timeFormat - should get defaults
        },
      }

      const result = PreferencesSerializer.restoreFromSnapshot(incomplete)
      expect(result.success).toBe(true)
      // Fields with defaults in schema should be filled in
      expect(result.data).toEqual({
        appearance: "light",
        language: "en",
        dateFormat: "mm/dd/yyyy", // Default
        timeFormat: "12h", // Default
      })
    })

    it("rejects snapshot with extra unknown fields", () => {
      const withExtra = {
        version: "1.0",
        timestamp: Date.now(),
        preferences: {
          ...DEFAULT_PREFERENCES,
          unknownField: "should-be-ignored",
        },
      }

      // Should still restore valid preferences (Zod strips unknown fields)
      const result = PreferencesSerializer.restoreFromSnapshot(withExtra)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(DEFAULT_PREFERENCES)
    })
  })

  describe("invalid JSON", () => {
    it("rejects malformed JSON string", () => {
      const result = PreferencesSerializer.fromJSON("{invalid json")
      expect(result.success).toBe(false)
      expect(result.errorCode).toBe("INVALID_JSON")
    })

    it("rejects empty string", () => {
      const result = PreferencesSerializer.fromJSON("")
      expect(result.success).toBe(false)
      expect(result.errorCode).toBe("INVALID_JSON")
    })

    it("rejects JSON with invalid snapshot structure", () => {
      const json = JSON.stringify({
        version: "1.0",
        preferences: "not an object",
      })

      const result = PreferencesSerializer.fromJSON(json)
      expect(result.success).toBe(false)
    })

    it("rejects empty JSON object", () => {
      const result = PreferencesSerializer.fromJSON("{}")
      expect(result.success).toBe(false)
      expect(result.errorCode).toBe("MISSING_VERSION")
    })

    it("rejects JSON array", () => {
      const result = PreferencesSerializer.fromJSON("[]")
      expect(result.success).toBe(false)
      // JSON array will be detected as invalid snapshot structure, not a version issue
      expect(result.errorCode).toBeDefined()
    })

    it("rejects JSON null", () => {
      const result = PreferencesSerializer.fromJSON("null")
      expect(result.success).toBe(false)
      expect(result.errorCode).toBe("INVALID_SNAPSHOT")
    })
  })

  describe("edge cases", () => {
    it("handles snapshots with extreme timestamps", () => {
      const snapshot: PreferencesSnapshot = {
        version: "1.0",
        timestamp: Number.MAX_SAFE_INTEGER,
        preferences: DEFAULT_PREFERENCES,
      }

      const result = PreferencesSerializer.restoreFromSnapshot(snapshot)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(DEFAULT_PREFERENCES)
    })

    it("handles snapshot with zero timestamp", () => {
      const snapshot: PreferencesSnapshot = {
        version: "1.0",
        timestamp: 0,
        preferences: DEFAULT_PREFERENCES,
      }

      const result = PreferencesSerializer.restoreFromSnapshot(snapshot)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(DEFAULT_PREFERENCES)
    })

    it("preserves all preference combinations", () => {
      const combinations: Preferences[] = [
        {
          appearance: "light",
          language: "en",
          dateFormat: "mm/dd/yyyy",
          timeFormat: "12h",
        },
        {
          appearance: "dark",
          language: "ja",
          dateFormat: "yyyy-mm-dd",
          timeFormat: "24h",
        },
        {
          appearance: "system",
          language: "ar",
          dateFormat: "dd/mm/yyyy",
          timeFormat: "24h",
        },
      ]

      for (const prefs of combinations) {
        const snapshot = PreferencesSerializer.createSnapshot(prefs)
        const result = PreferencesSerializer.restoreFromSnapshot(snapshot)
        expect(result.success).toBe(true)
        expect(result.data).toEqual(prefs)
      }
    })

    it("handles multiple serialization cycles", () => {
      let prefs = DEFAULT_PREFERENCES

      // Cycle 1
      let snapshot = PreferencesSerializer.createSnapshot(prefs)
      let result = PreferencesSerializer.restoreFromSnapshot(snapshot)
      expect(result.success).toBe(true)
      prefs = result.data!
      expect(prefs).toEqual(DEFAULT_PREFERENCES)

      // Cycle 2
      snapshot = PreferencesSerializer.createSnapshot(prefs)
      result = PreferencesSerializer.restoreFromSnapshot(snapshot)
      expect(result.success).toBe(true)
      prefs = result.data!
      expect(prefs).toEqual(DEFAULT_PREFERENCES)

      // Cycle 3
      snapshot = PreferencesSerializer.createSnapshot(prefs)
      result = PreferencesSerializer.restoreFromSnapshot(snapshot)
      expect(result.success).toBe(true)
      prefs = result.data!
      expect(prefs).toEqual(DEFAULT_PREFERENCES)
    })
  })

  describe("CURRENT_VERSION constant", () => {
    it("is set to 1.0", () => {
      expect(PreferencesSerializer.CURRENT_VERSION).toBe("1.0")
    })

    it("matches snapshots created by createSnapshot", () => {
      const snapshot = PreferencesSerializer.createSnapshot(DEFAULT_PREFERENCES)
      expect(snapshot.version).toBe(PreferencesSerializer.CURRENT_VERSION)
    })
  })
})
