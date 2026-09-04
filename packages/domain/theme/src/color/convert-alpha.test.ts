import { describe, expect, it } from "vitest"
import { toOklch, toRgb } from "./convert"

describe("convert: alpha survives culori round-trip (new finding, folded into F1)", () => {
  it("toOklch preserves alpha from an RgbObject", () => {
    const result = toOklch({ r: 1, g: 0, b: 0, a: 0.4 })
    expect(result.a).toBeCloseTo(0.4, 5)
  })

  it("toRgb preserves alpha from an OklchColor", () => {
    const result = toRgb({ l: 0.5, c: 0.15, h: 120, a: 0.7 })
    expect(result.a).toBeCloseTo(0.7, 5)
  })

  it("omits alpha when the input has none", () => {
    const result = toOklch({ r: 1, g: 0, b: 0 })
    expect(result.a).toBeUndefined()
  })
})
