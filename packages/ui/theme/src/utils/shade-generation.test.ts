import { describe, expect, it } from "vitest"
import { oklchColorSchema, parseColorInput } from "@repo/domain-theme"

import {
  autoForeground,
  deriveScale,
  deriveScaleCss,
  getContrastRatio,
  HUE_PRESETS,
  SCALE_STEPS,
  toCss,
} from "./shade-generation"

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
        expect(result.success, `step ${step}: ${JSON.stringify(scale[step])}`).toBe(true)
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
    expect(toCss({ l: 0.58, c: 0.15, h: 250 })).toBe("oklch(58.0% 0.1500 250.0)")
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

    // A light background wants dark text, and vice versa.
    expect(autoForeground({ l: 0.95, c: 0.02, h: 250 }).l).toBeLessThan(0.5)
    expect(autoForeground({ l: 0.2, c: 0.02, h: 250 }).l).toBeGreaterThan(0.5)
  })
})
