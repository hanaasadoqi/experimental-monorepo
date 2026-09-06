import { describe, expect, it } from "vitest"

import {
  appearancePreferenceSchema,
  DEFAULT_APPEARANCE_PREFERENCE,
} from "./appearance"

describe("appearance preference", () => {
  it.each(["light", "dark", "system"])("accepts %s", (preference) => {
    expect(appearancePreferenceSchema.parse(preference)).toBe(preference)
  })

  it("defaults to system", () => {
    expect(DEFAULT_APPEARANCE_PREFERENCE).toBe("system")
  })
})
