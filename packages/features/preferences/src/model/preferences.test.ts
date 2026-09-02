import { describe, expect, it } from "vitest"

import { appearancePreferenceSchema } from "./appearance.js"
import { DEFAULT_PREFERENCES, preferencesSchema } from "./preferences.js"

describe("preferencesSchema", () => {
  it.each(["light", "dark", "system"])(
    "accepts preferences with the canonical %s appearance preference",
    (appearance) => {
      expect(preferencesSchema.safeParse({ appearance })).toEqual({
        success: true,
        data: { appearance },
      })
    }
  )

  it.each([
    { appearance: "automatic" },
    { appearance: "Light" },
    { appearance: "" },
    { appearance: null },
    {},
    null,
  ])("rejects invalid preferences: %j", (preferences) => {
    expect(preferencesSchema.safeParse(preferences).success).toBe(false)
  })
})

describe("DEFAULT_PREFERENCES", () => {
  it("is valid preferences data", () => {
    expect(preferencesSchema.safeParse(DEFAULT_PREFERENCES)).toEqual({
      success: true,
      data: { appearance: "system" },
    })
  })

  it("contains a valid default appearance preference", () => {
    expect(
      appearancePreferenceSchema.safeParse(DEFAULT_PREFERENCES.appearance)
        .success
    ).toBe(true)
  })
})
