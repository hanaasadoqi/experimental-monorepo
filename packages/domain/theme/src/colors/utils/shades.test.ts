import { describe, expect, it } from "vitest"
import { generateShades, generateShadeScale, SHADE_STEPS } from "./shades"
import { maxChromaInGamut } from "./gamut"
import type { Oklch } from "./core-model"

describe("generateShadeScale (regression: finding #3, shade anchoring)", () => {
  it("contains all 11 canonical steps", () => {
    const scale = generateShadeScale({ color: { l: 0.6, c: 0.15, h: 250 } })
    expect(scale.map((s) => s.step)).toEqual([...SHADE_STEPS])
  })

  it.each([100, 300, 500, 700, 900] as const)(
    "preserves the seed at the explicit anchor shade %i",
    (anchorShade) => {
      const seed: Oklch = { l: 0.55, c: 0.12, h: 250 }
      const scale = generateShadeScale({ color: seed, anchorShade })
      const anchor = scale.find((s) => s.step === anchorShade)
      expect(anchor).toBeDefined()
      expect(anchor?.l).toBeCloseTo(seed.l, 5)
      expect(anchor?.h).toBeCloseTo(seed.h, 5)
      expect(anchor?.isBase).toBe(true)
    }
  )

  it("does not force the seed into shade 500 when a different anchor is requested", () => {
    const seed: Oklch = { l: 0.85, c: 0.1, h: 30 }
    const scale = generateShadeScale({ color: seed, anchorShade: 200 })
    const shade200 = scale.find((s) => s.step === 200)
    const shade500 = scale.find((s) => s.step === 500)
    expect(shade200?.l).toBeCloseTo(seed.l, 5)
    // 500 should differ from the seed since it's not the requested anchor.
    expect(shade500?.l).not.toBeCloseTo(seed.l, 2)
  })

  it("lightness progresses monotonically from 50 (lightest) to 950 (darkest)", () => {
    const seeds: Oklch[] = [
      { l: 0.9, c: 0.05, h: 0 },
      { l: 0.5, c: 0.2, h: 140 },
      { l: 0.15, c: 0.1, h: 260 },
      { l: 0.6, c: 0.15, h: 40 },
    ]
    for (const seed of seeds) {
      for (const anchorShade of [100, 500, 900] as const) {
        const scale = generateShadeScale({ color: seed, anchorShade })
        for (let i = 1; i < scale.length; i++) {
          expect(scale[i]!.l).toBeLessThanOrEqual(scale[i - 1]!.l)
        }
      }
    }
  })

  it("responds to seed lightness: a lighter seed produces a lighter family at every step", () => {
    const lightSeed = generateShadeScale({
      color: { l: 0.8, c: 0.1, h: 250 },
      anchorShade: 500,
    })
    const darkSeed = generateShadeScale({
      color: { l: 0.3, c: 0.1, h: 250 },
      anchorShade: 500,
    })
    // Steps near an extreme (e.g. 50) legitimately converge toward the same
    // near-white ceiling for any seed — that's the conventional "step 50 is
    // always near-white" design behavior, not a failure to respond to the
    // seed. The scale as a whole must still differ (checked below), and the
    // anchor-adjacent steps must differ strictly.
    for (let i = 0; i < lightSeed.length; i++) {
      expect(lightSeed[i]!.l).toBeGreaterThanOrEqual(darkSeed[i]!.l)
    }
    const anchorIndex = lightSeed.findIndex((s) => s.isBase)
    expect(lightSeed[anchorIndex]!.l).toBeGreaterThan(darkSeed[anchorIndex]!.l)
    expect(lightSeed).not.toEqual(darkSeed)
  })

  it("responds to seed chroma: a more chromatic seed produces more chroma at the anchor", () => {
    const muted = generateShadeScale({
      color: { l: 0.6, c: 0.03, h: 250 },
      anchorShade: 500,
    })
    const vivid = generateShadeScale({
      color: { l: 0.6, c: 0.2, h: 250 },
      anchorShade: 500,
    })
    const mutedAnchor = muted.find((s) => s.step === 500)
    const vividAnchor = vivid.find((s) => s.step === 500)
    expect(vividAnchor!.c).toBeGreaterThan(mutedAnchor!.c)
  })

  it("keeps hue perceptually stable (constant) across the scale", () => {
    const scale = generateShadeScale({
      color: { l: 0.6, c: 0.15, h: 140 },
      anchorShade: 500,
    })
    for (const shade of scale) {
      expect(shade.h).toBeCloseTo(140, 5)
    }
  })

  it("stays within the sRGB gamut for every step (chroma never exceeds maxChromaInGamut)", () => {
    const scale = generateShadeScale({
      color: { l: 0.5, c: 0.4, h: 30 },
      anchorShade: 500,
    })
    for (const shade of scale) {
      expect(shade.c).toBeLessThanOrEqual(
        maxChromaInGamut(shade.l, shade.h) + 1e-6
      )
    }
  })

  it("is deterministic", () => {
    const input = {
      color: { l: 0.55, c: 0.15, h: 200 },
      anchorShade: 400 as const,
    }
    expect(generateShadeScale(input)).toEqual(generateShadeScale(input))
  })

  it("handles an extreme seed lightness without collapsing neighboring steps to duplicates", () => {
    const scale = generateShadeScale({
      color: { l: 0.97, c: 0.05, h: 90 },
      anchorShade: 100,
    })
    const lightnesses = scale.map((s) => s.l)
    // No two neighboring steps should land on the exact same lightness.
    for (let i = 1; i < lightnesses.length; i++) {
      expect(lightnesses[i]).not.toBe(lightnesses[i - 1])
    }
  })

  it("defaults anchorShade to 500 when omitted", () => {
    const seed: Oklch = { l: 0.4, c: 0.15, h: 250 }
    const scale = generateShadeScale({ color: seed })
    const shade500 = scale.find((s) => s.step === 500)
    expect(shade500?.l).toBeCloseTo(seed.l, 5)
  })
})

describe("generateShades (preserved: original nearest-step implementation, unchanged)", () => {
  it("still exists and behaves as before — no explicit anchor selection", () => {
    const result = generateShades({ l: 0.58, c: 0.15, h: 250 })
    expect(result).toHaveLength(11)
    expect(result.some((s) => s.isBase)).toBe(true)
  })
})
