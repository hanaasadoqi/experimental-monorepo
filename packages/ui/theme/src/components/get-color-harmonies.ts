import { clampH } from "@repo/domain-theme/color"
import type { Oklch, ColorHarmony } from "@repo/domain-theme/color"

/**
 * Named hue-rotation sets for color harmony generation.
 * Used for color picker preview and harmony visualization.
 */
export interface ColorHarmonyResult {
  type: ColorHarmony
  name: string
  description: string
  colors: Oklch[]
}

export function getColorHarmonies(base: Oklch): ColorHarmonyResult[] {
  const hue = (deg: number) => clampH(base.h + deg)

  return [
    {
      type: "complementary",
      name: "Complementary",
      description: "Opposite on the wheel — high contrast pair",
      colors: [{ ...base, h: hue(180) }],
    },
    {
      type: "analogous",
      name: "Analogous",
      description: "Adjacent hues — harmonious and cohesive",
      colors: [
        { ...base, h: hue(30) },
        { ...base, h: hue(-30) },
      ],
    },
    {
      type: "triadic",
      name: "Triadic",
      description: "Three hues evenly spaced — vibrant and balanced",
      colors: [
        { ...base, h: hue(120) },
        { ...base, h: hue(240) },
      ],
    },
    {
      type: "split-complementary",
      name: "Split Complement",
      description: "Complement split — less tension, more variety",
      colors: [
        { ...base, h: hue(150) },
        { ...base, h: hue(210) },
      ],
    },
    {
      type: "tetradic",
      name: "Tetradic",
      description: "Four hues in a rectangle — complex but balanced",
      colors: [
        { ...base, h: hue(60) },
        { ...base, h: hue(120) },
        { ...base, h: hue(180) },
      ],
    },
  ]
}
