import { describe, expect, it } from "vitest"

import { preferencesSchema } from "./model"
import { DEFAULT_PREFERENCES } from "./defaults"
import { DEFAULT_APPEARANCE_PREFERENCE } from "../appearance"
import { DEFAULT_LANGUAGE_PREFERENCE } from "../language"
import { DEFAULT_DATE_FORMAT, DEFAULT_TIME_FORMAT } from "../date-time"

describe("preferences", () => {
  it("accepts valid preference object", () => {
    const prefs = {
      appearance: DEFAULT_APPEARANCE_PREFERENCE,
      language: DEFAULT_LANGUAGE_PREFERENCE,
      dateFormat: DEFAULT_DATE_FORMAT,
      timeFormat: DEFAULT_TIME_FORMAT,
    }
    expect(preferencesSchema.parse(prefs)).toEqual(prefs)
  })

  it("has correct defaults", () => {
    expect(DEFAULT_PREFERENCES).toEqual({
      appearance: "system",
      language: "en",
      dateFormat: "mm/dd/yyyy",
      timeFormat: "12h",
    })
  })

  it("validates combined schema", () => {
    expect(preferencesSchema.parse(DEFAULT_PREFERENCES)).toEqual(
      DEFAULT_PREFERENCES
    )
  })
})
