import { describe, expect, it } from "vitest"

import { appearancePreferenceSchema } from "./model"
import { DEFAULT_APPEARANCE_PREFERENCE } from "./defaults"

describe("appearance preference", () => {
  it.each(["light", "dark", "system"])("accepts %s", (preference) => {
    expect(appearancePreferenceSchema.parse(preference)).toBe(preference)
  })

  it("defaults to system", () => {
    expect(DEFAULT_APPEARANCE_PREFERENCE).toBe("system")
  })
})
