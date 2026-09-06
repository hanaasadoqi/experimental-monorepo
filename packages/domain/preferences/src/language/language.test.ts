import { describe, expect, it } from "vitest"

import { languagePreferenceSchema } from "./model"
import {
  DEFAULT_LANGUAGE_PREFERENCE,
  LANGUAGE_PREFERENCE_OPTIONS,
} from "./defaults"

describe("language preference", () => {
  it.each(LANGUAGE_PREFERENCE_OPTIONS)("accepts %s", (preference) => {
    expect(languagePreferenceSchema.parse(preference)).toBe(preference)
  })

  it("defaults to en", () => {
    expect(DEFAULT_LANGUAGE_PREFERENCE).toBe("en")
  })
})
