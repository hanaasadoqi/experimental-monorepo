import { describe, expect, it } from "vitest"

import { getColorHarmonies } from "./get-color-harmonies"

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

  it("produces every named harmony type in the domain union", () => {
    const harmonies = getColorHarmonies({ l: 0.5, c: 0.1, h: 0 })
    expect(harmonies.map((h) => h.type)).toEqual([
      "complementary",
      "analogous",
      "triadic",
      "split-complementary",
      "tetradic",
      "rectangle",
    ])
  })

  it("distinguishes tetradic (square) from rectangle", () => {
    const harmonies = getColorHarmonies({ l: 0.5, c: 0.1, h: 0 })
    const tetradic = harmonies.find((h) => h.type === "tetradic")
    const rectangle = harmonies.find((h) => h.type === "rectangle")

    expect(tetradic?.colors.map((c) => c.h)).toEqual([90, 180, 270])
    expect(rectangle?.colors.map((c) => c.h)).toEqual([60, 180, 240])
  })

  it("spaces triadic hues 120 degrees apart", () => {
    const [, , triadic] = getColorHarmonies({ l: 0.5, c: 0.1, h: 40 })
    expect(triadic?.colors.map((c) => c.h)).toEqual([160, 280])
  })
})
