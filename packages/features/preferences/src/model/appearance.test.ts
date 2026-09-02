import { describe, expect, it } from "vitest"

import { appearancePreferenceSchema } from "./appearance.js"

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
