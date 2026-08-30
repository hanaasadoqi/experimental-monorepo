import { describe, expect, it } from "vitest"

import {
  AppearancePreference,
  appearancePreferenceSchema,
} from "./preferences.js"
import { preferencesStateSchema } from "./preferences.js"

describe("appearancePreferenceSchema", () => {
  it.each(["light", "dark", "system"])(
    "accepts the canonical %s preference",
    (preference) => {
      const result = appearancePreferenceSchema.safeParse(preference)

      expect(result).toEqual({ success: true, data: preference })
    }
  )

  it.each(["automatic", "Light", "", null, undefined])(
    "rejects the non-canonical value %s",
    (value) => {
      expect(appearancePreferenceSchema.safeParse(value).success).toBe(false)
    }
  )
})

describe("preferencesStateSchema", () => {
  it("accepts a valid preferences state", () => {
    const validState = {
      appearancePreference: "light",
      setAppearancePreference: (preference: AppearancePreference) => preference,
    }

    const result = preferencesStateSchema.safeParse(validState)

    expect(result.success).toBe(true)
  })

  it("rejects an invalid preferences state", () => {
    const invalidState = {
      appearancePreference: "automatic", // Invalid value
      setAppearancePreference: (preference: AppearancePreference) => preference,
    }

    const result = preferencesStateSchema.safeParse(invalidState)

    expect(result.success).toBe(false)
  })
})
