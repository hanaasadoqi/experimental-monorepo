import { describe, expect, it } from "vitest"
import { generateHarmony, HARMONY_HUE_OFFSETS } from "./harmony"
import { maxChromaInGamut } from "./gamut"
import type { ColorHarmony, Oklch } from "./model"

const seed: Oklch = { l: 0.6, c: 0.15, h: 100 }

describe("generateHarmony (regression: finding #5, harmony support)", () => {
  const rotatingTypes: Exclude<ColorHarmony, "monochromatic">[] = [
    "complementary",
    "analogous",
    "triadic",
    "split-complementary",
    "tetradic",
    "square",
    "rectangle",
    "double-split-complementary",
  ]

  it.each(rotatingTypes)(
    "generates the documented hue geometry for %s",
    (type) => {
      const colors = generateHarmony(seed, type)
      const offsets = HARMONY_HUE_OFFSETS[type]
      expect(colors).toHaveLength(offsets.length)
      for (let i = 0; i < offsets.length; i++) {
        const expectedHue = (((seed.h + offsets[i]!) % 360) + 360) % 360
        expect(colors[i]!.h).toBeCloseTo(expectedHue, 5)
      }
    }
  )

  it("complementary is exactly [0, 180]", () => {
    expect(HARMONY_HUE_OFFSETS.complementary).toEqual([0, 180])
  })

  it("triadic is exactly [0, 120, 240]", () => {
    expect(HARMONY_HUE_OFFSETS.triadic).toEqual([0, 120, 240])
  })

  it("split-complementary is exactly [0, 150, 210]", () => {
    expect(HARMONY_HUE_OFFSETS["split-complementary"]).toEqual([0, 150, 210])
  })

  it("square and rectangle are distinguished (not both just 'tetradic')", () => {
    expect(HARMONY_HUE_OFFSETS.square).toEqual([0, 90, 180, 270])
    expect(HARMONY_HUE_OFFSETS.rectangle).toEqual([0, 60, 180, 240])
    expect(HARMONY_HUE_OFFSETS.square).not.toEqual(
      HARMONY_HUE_OFFSETS.rectangle
    )
  })

  it("tetradic is a documented, deliberate alias of square (not an accidental duplicate)", () => {
    expect(HARMONY_HUE_OFFSETS.tetradic).toEqual(HARMONY_HUE_OFFSETS.square)
  })

  it("double-split-complementary is exactly [-30, 30, 150, 210]", () => {
    expect(HARMONY_HUE_OFFSETS["double-split-complementary"]).toEqual([
      -30, 30, 150, 210,
    ])
  })

  it("wraps hue correctly at the 0/360 boundary", () => {
    const nearWrap: Oklch = { l: 0.6, c: 0.1, h: 350 }
    const colors = generateHarmony(nearWrap, "complementary")
    expect(colors[0]!.h).toBeCloseTo(350, 5)
    expect(colors[1]!.h).toBeCloseTo(170, 5) // 350 + 180 = 530 -> 170
  })

  it("preserves seed lightness exactly across every rotating type (character preservation)", () => {
    for (const type of rotatingTypes) {
      const colors = generateHarmony(seed, type)
      for (const color of colors) {
        expect(color.l).toBeCloseTo(seed.l, 10)
      }
    }
  })

  it("preserves seed chroma when it's already in-gamut at the rotated hue", () => {
    // A modest chroma at l=0.6 should be in-gamut for most hues.
    const colors = generateHarmony(seed, "triadic")
    for (const color of colors) {
      expect(color.c).toBeLessThanOrEqual(seed.c + 1e-6)
    }
  })

  it("gamut-fits every generated color (chroma never exceeds maxChromaInGamut)", () => {
    const vivid: Oklch = { l: 0.7, c: 0.3, h: 120 }
    for (const type of rotatingTypes) {
      const colors = generateHarmony(vivid, type)
      for (const color of colors) {
        expect(color.c).toBeLessThanOrEqual(
          maxChromaInGamut(color.l, color.h) + 1e-6
        )
      }
    }
  })

  describe("monochromatic", () => {
    it("does not rotate hue — every variant matches the seed hue", () => {
      const colors = generateHarmony(seed, "monochromatic")
      expect(colors.length).toBeGreaterThan(1)
      for (const color of colors) {
        expect(color.h).toBeCloseTo(seed.h, 10)
      }
    })

    it("varies lightness across variants", () => {
      const colors = generateHarmony(seed, "monochromatic")
      const lightnesses = colors.map((c) => c.l)
      expect(new Set(lightnesses).size).toBeGreaterThan(1)
    })

    it("includes the seed's own lightness among the variants", () => {
      const colors = generateHarmony(seed, "monochromatic")
      expect(colors.some((c) => Math.abs(c.l - seed.l) < 1e-6)).toBe(true)
    })

    it("stays gamut-safe", () => {
      const colors = generateHarmony(seed, "monochromatic")
      for (const color of colors) {
        expect(color.c).toBeLessThanOrEqual(
          maxChromaInGamut(color.l, color.h) + 1e-6
        )
      }
    })
  })

  it("is deterministic", () => {
    expect(generateHarmony(seed, "rectangle")).toEqual(
      generateHarmony(seed, "rectangle")
    )
  })
})
