import { describe, expect, it } from "vitest"

import { getColorHarmonies } from "./harmony"

describe("getColorHarmonies", () => {
  it("rotates complementary to the opposite hue", () => {
    const [complementary] = getColorHarmonies({ l: 0.55, c: 0.15, h: 0 })
    expect(complementary?.colors[0]?.h).toBe(180)
  })

  it("wraps hue rotation instead of exceeding 360", () => {
    const [complementary] = getColorHarmonies({ l: 0.55, c: 0.15, h: 200 })
    expect(complementary?.colors[0]?.h).toBe(20)
  })

  it("wraps negative rotation back into range", () => {
    const [, analogous] = getColorHarmonies({ l: 0.55, c: 0.15, h: 10 })
    expect(analogous?.colors[1]?.h).toBe(340)
  })

  it("preserves lightness and chroma across every generated color", () => {
    const base = { l: 0.42, c: 0.18, h: 90 }
    const harmonies = getColorHarmonies(base)
    for (const harmony of harmonies) {
      for (const color of harmony.colors) {
        expect(color.l).toBe(base.l)
        expect(color.c).toBe(base.c)
      }
    }
  })

  it("produces the five named harmony types, faithful to the reference implementation", () => {
    const harmonies = getColorHarmonies({ l: 0.5, c: 0.1, h: 0 })
    expect(harmonies.map((h) => h.type)).toEqual([
      "complementary",
      "analogous",
      "triadic",
      "split-complementary",
      "tetradic",
    ])
  })

  it("spaces triadic hues 120 degrees apart", () => {
    const [, , triadic] = getColorHarmonies({ l: 0.5, c: 0.1, h: 40 })
    expect(triadic?.colors.map((c) => c.h)).toEqual([160, 280])
  })
})
