import { describe, expect, it } from "vitest"
import { normalizeOklch } from "./normalize"

describe("normalizeOklch (regression: finding #7)", () => {
  it("converts OklchComponents' radian hue to degrees, not wraps it as-is", () => {
    // hue: Math.PI radians === 180 degrees. Passing it straight through
    // clampH (which wraps assuming a 0..360 *degree* domain) used to leave
    // it at ~3.14.
    const result = normalizeOklch({ lightness: 0.5, chroma: 0.1, hue: Math.PI })
    expect(result.h).toBeCloseTo(180, 5)
  })

  it("leaves an already-degrees OklchColor hue untouched", () => {
    const result = normalizeOklch({ l: 0.5, c: 0.1, h: 180 })
    expect(result.h).toBeCloseTo(180, 5)
  })

  it("wraps a radian hue that exceeds 2*PI correctly once converted", () => {
    // 3*PI radians = 540 degrees -> wraps to 180.
    const result = normalizeOklch({
      lightness: 0.5,
      chroma: 0.1,
      hue: 3 * Math.PI,
    })
    expect(result.h).toBeCloseTo(180, 5)
  })

  it("treats a zero radian hue as 0 degrees, not the 'missing' default", () => {
    const result = normalizeOklch({ lightness: 0.5, chroma: 0.1, hue: 0 })
    expect(result.h).toBe(0)
  })
})
