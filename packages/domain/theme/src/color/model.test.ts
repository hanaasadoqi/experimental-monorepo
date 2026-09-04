import { describe, expect, it } from "vitest"
import { rgbStrSchema } from "./model"

describe("rgbStrSchema grammar (regression: finding #4e)", () => {
  it("accepts rgb() with exactly 3 channels", () => {
    expect(rgbStrSchema.safeParse("rgb(255, 0, 0)").success).toBe(true)
  })

  it("accepts rgba() with exactly 4 channels", () => {
    expect(rgbStrSchema.safeParse("rgba(255, 0, 0, 0.5)").success).toBe(true)
  })

  it("rejects rgb() carrying an alpha channel", () => {
    // Matches the codebase's own serializer contract (convert.ts::rgbToCss):
    // alpha present => "rgba(...)", alpha absent => "rgb(...)". A parser that
    // accepts "rgb(...)" with alpha disagrees with what this package ever emits.
    expect(rgbStrSchema.safeParse("rgb(255, 0, 0, 0.5)").success).toBe(false)
  })

  it("rejects rgba() missing its alpha channel", () => {
    expect(rgbStrSchema.safeParse("rgba(255, 0, 0)").success).toBe(false)
  })
})
