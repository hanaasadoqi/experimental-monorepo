import { describe, expect, it } from "vitest"
import { toOklch, toRgb, oklchToHex, rgbToHex } from "./convert"
import { parseRgbStringToOklch } from "./parse"

/**
 * Reference values obtained directly from `culori`'s `converter()` with an
 * explicit `mode` discriminator (the correct call shape), independent of
 * this package's own wrapper functions under test.
 */
describe("convert: Culori mode discriminator", () => {
  it("toOklch converts a bare RGB object, not just relabels it", () => {
    // Regression for finding #1: without an explicit `mode: "rgb"`, culori's
    // converter relabels {r,g,b} as-is instead of converting, so `.l`/`.c`/`.h`
    // come back undefined and normalizeOklch coerces them to 0.
    const result = toOklch({ r: 1, g: 0, b: 0 })
    expect(result).not.toEqual({ l: 0, c: 0, h: 0 })
    expect(result.l).toBeCloseTo(0.628, 2)
    expect(result.c).toBeCloseTo(0.2577, 3)
    expect(result.h).toBeCloseTo(29.23, 1)
  })

  it("toRgb converts a bare OKLCH object, not just relabels it", () => {
    const result = toRgb({ l: 0.5, c: 0.15, h: 120 })
    expect(result.r).not.toBeUndefined()
    expect(result.g).not.toBeUndefined()
    expect(result.b).not.toBeUndefined()
    expect(result.r).toBeCloseTo(0.3507, 3)
    expect(result.g).toBeCloseTo(0.4305, 3)
  })

  it('parseRgbStringToOklch("rgb(255, 0, 0)") does not collapse to black', () => {
    const result = parseRgbStringToOklch("rgb(255, 0, 0)")
    expect(result).not.toBeNull()
    expect(result).not.toEqual({ l: 0, c: 0, h: 0 })
    expect(result?.l).toBeCloseTo(0.628, 2)
    expect(result?.h).toBeCloseTo(29.23, 1)
  })

  it("round-trips known anchor colors through oklch <-> hex", () => {
    // #ff0000 -> oklch -> hex should stay red (allowing sRGB gamut rounding).
    const oklchRed = toOklch({ r: 1, g: 0, b: 0 })
    const hex = oklchToHex(oklchRed)
    expect(hex.toLowerCase()).toBe("#ff0000")
  })

  it("rgbToHex produces correct hex for known anchors", () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe("#000000")
    expect(rgbToHex({ r: 1, g: 1, b: 1 })).toBe("#FFFFFF")
    expect(rgbToHex({ r: 1, g: 0, b: 0 })).toBe("#FF0000")
  })
})
