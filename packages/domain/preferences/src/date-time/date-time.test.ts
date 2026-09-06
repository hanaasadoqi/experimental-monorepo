import { describe, expect, it } from "vitest"

import { dateFormatPreferenceSchema, timeFormatPreferenceSchema } from "./model"
import {
  DEFAULT_DATE_FORMAT,
  DATE_FORMAT_OPTIONS,
  DEFAULT_TIME_FORMAT,
  TIME_FORMAT_OPTIONS,
} from "./defaults"

describe("date format preference", () => {
  it.each(DATE_FORMAT_OPTIONS)("accepts %s", (preference) => {
    expect(dateFormatPreferenceSchema.parse(preference)).toBe(preference)
  })

  it("defaults to mm/dd/yyyy", () => {
    expect(DEFAULT_DATE_FORMAT).toBe("mm/dd/yyyy")
  })

  it("updates to selected date format", () => {
    const newDateFormat = "dd/mm/yyyy"
    expect(dateFormatPreferenceSchema.parse(newDateFormat)).toBe(newDateFormat)
  })
})

describe("time format preference", () => {
  it.each(TIME_FORMAT_OPTIONS)("accepts %s", (preference) => {
    expect(timeFormatPreferenceSchema.parse(preference)).toBe(preference)
  })

  it("defaults to 12h", () => {
    expect(DEFAULT_TIME_FORMAT).toBe("12h")
  })

  it("updates to selected time format", () => {
    const newTimeFormat = "12h"
    expect(timeFormatPreferenceSchema.parse(newTimeFormat)).toBe(newTimeFormat)
  })
})
