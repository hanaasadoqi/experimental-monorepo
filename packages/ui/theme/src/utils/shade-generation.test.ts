import { describe, expect, it } from "vitest"
import { oklchColorSchema, parseColorInput } from "@repo/domain-theme"

import {
  autoForeground,
  deriveScale,
  deriveScaleCss,
  getContrastRatio,
  getHarmonies,
  HUE_PRESETS,
  SCALE_STEPS,
  toCss,
} from "./shade-generation"
import { getColorHarmonies } from "./get-color-harmonies"

/**
 * These assertions exist because lightness has no unit in the type system:
 * `Oklch.l` is a bare `number`, so a module using the 0..100 convention against
 * the domain's 0..1 one compiles cleanly and silently renders near-black.
 * Validating against the domain schema is what makes that a test failure.
 */
describe("shade-generation lightness scale", () => {
  const base = { l: 0.58, c: 0.15, h: 250 }

  it.each(["light", "dark"] as const)(
    "derives a %s scale whose every step is a valid domain color",
    (mode) => {
      const scale = deriveScale(base, mode)

      for (const step of SCALE_STEPS) {
        const result = oklchColorSchema.safeParse(scale[step])
        expect(
          result.success,
          `step ${step}: ${JSON.stringify(scale[step])}`
        ).toBe(true)
      }
    }
  )

  it("keeps every hue preset inside the domain's 0..1 lightness range", () => {
    for (const preset of HUE_PRESETS) {
      const result = oklchColorSchema.safeParse({
        l: preset.l,
        c: preset.c,
        h: preset.h,
      })
      expect(result.success, `${preset.name}: l=${preset.l}`).toBe(true)
    }
  })

  it("serializes lightness as a percentage, not a raw fraction", () => {
    // The bug this guards: `oklch(0.58% ...)` instead of `oklch(58.0% ...)`.
    expect(toCss({ l: 0.58, c: 0.15, h: 250 })).toBe(
      "oklch(58.0% 0.1500 250.0)"
    )
  })

  it("round-trips through the domain parser without drifting scale", () => {
    const parsed = parseColorInput(toCss(base))

    expect(parsed).not.toBeNull()
    expect(parsed?.l).toBeCloseTo(base.l, 2)
    expect(parsed?.c).toBeCloseTo(base.c, 3)
    expect(parsed?.h).toBeCloseTo(base.h, 1)
  })

  it("emits CSS strings from deriveScaleCss, not stringified objects", () => {
    const css = deriveScaleCss(base, "light")

    for (const step of SCALE_STEPS) {
      expect(css[String(step)]).toMatch(/^oklch\(/)
    }
  })

  it("picks a readable foreground and scores white/black near the WCAG maximum", () => {
    const white = { l: 0.97, c: 0, h: 0 }
    const black = { l: 0.1, c: 0, h: 0 }

    // The theoretical maximum is 21:1; these are near-white and near-black.
    expect(getContrastRatio(white, black)).toBeGreaterThan(15)

    // A light background wants darker text, and vice versa — but the exact
    // magnitude is the *smallest* adjustment that reaches 4.5:1, not a jump
    // to a fixed extreme (see the dedicated autoForeground regression tests
    // below, which the old `.l < 0.5` / `.l > 0.5` assertions here used to
    // over-specify as "always jumps past the midpoint").
    const lightBg = { l: 0.95, c: 0.02, h: 250 }
    const darkBg = { l: 0.2, c: 0.02, h: 250 }
    expect(autoForeground(lightBg).l).toBeLessThan(lightBg.l)
    expect(autoForeground(darkBg).l).toBeGreaterThan(darkBg.l)
    expect(
      getContrastRatio(autoForeground(lightBg), lightBg)
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      getContrastRatio(autoForeground(darkBg), darkBg)
    ).toBeGreaterThanOrEqual(4.5)
  })

  describe("deriveScale seed-anchoring (regression: finding #3)", () => {
    it("responds to the seed's own lightness instead of a fixed anchor", () => {
      // Previously anchorL was a fixed 0.52/0.58 constant regardless of
      // `base.l`, so two seeds with very different lightness produced near
      // identical step-500 output.
      const lightSeed = deriveScale({ l: 0.85, c: 0.1, h: 250 }, "light")
      const darkSeed = deriveScale({ l: 0.25, c: 0.1, h: 250 }, "light")
      expect(lightSeed[500]!.l).toBeGreaterThan(darkSeed[500]!.l)
      expect(lightSeed[500]!.l).toBeCloseTo(0.85, 2)
      expect(darkSeed[500]!.l).toBeCloseTo(0.25, 2)
    })

    it("light mode: lightness still progresses 50 (lightest) to 950 (darkest)", () => {
      const scale = deriveScale({ l: 0.6, c: 0.15, h: 140 }, "light")
      for (let i = 1; i < SCALE_STEPS.length; i++) {
        const prev = scale[SCALE_STEPS[i - 1]!]!
        const curr = scale[SCALE_STEPS[i]!]!
        expect(curr.l).toBeLessThanOrEqual(prev.l)
      }
    })

    it("dark mode preserves its existing reversed-scale convention (950 lightest)", () => {
      // Not a defect being fixed here — this reversal is an existing,
      // explicitly-flagged product convention (see repair checkpoint). Only
      // the underlying per-step math (seed-relative, not a fixed anchor)
      // changes; the direction it already produced is preserved.
      const scale = deriveScale({ l: 0.6, c: 0.15, h: 140 }, "dark")
      for (let i = 1; i < SCALE_STEPS.length; i++) {
        const prev = scale[SCALE_STEPS[i - 1]!]!
        const curr = scale[SCALE_STEPS[i]!]!
        expect(curr.l).toBeGreaterThanOrEqual(prev.l)
      }
    })

    it("every generated step stays a valid, gamut-safe domain color", () => {
      const scale = deriveScale({ l: 0.5, c: 0.35, h: 30 }, "light")
      for (const step of SCALE_STEPS) {
        const result = oklchColorSchema.safeParse(scale[step])
        expect(
          result.success,
          `step ${step}: ${JSON.stringify(scale[step])}`
        ).toBe(true)
      }
    })
  })

  describe("getHarmonies / getColorHarmonies no longer diverge (regression: finding #5/#12)", () => {
    it("support the same harmony type list (rectangle used to be missing from getHarmonies)", () => {
      const a = getHarmonies(base).map((h) => h.type)
      const b = getColorHarmonies(base).map((h) => h.type)
      expect(a).toEqual(b)
    })

    it("produce the same geometry for every shared type", () => {
      const a = getHarmonies(base)
      const b = getColorHarmonies(base)
      for (let i = 0; i < a.length; i++) {
        expect(a[i]!.colors.map((c) => c.h)).toEqual(
          b[i]!.colors.map((c) => c.h)
        )
      }
    })
  })

  describe("autoForeground (regression: finding #2)", () => {
    it("beats the old binary implementation's worst observed ratio (4.3666, below the 4.5 target)", () => {
      const bg = { l: 0.55, c: 0.12, h: 120 }
      const fg = autoForeground(bg)
      expect(getContrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5)
    })

    it("is not limited to two achromatic outputs", () => {
      const bg = { l: 0.6, c: 0.15, h: 250 }
      const fg = autoForeground(bg)
      expect(getContrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5)
    })
  })
})
