import {
  generateHarmony,
  HARMONY_HUE_OFFSETS,
  type Oklch,
  type ColorHarmony,
} from "@repo/domain-theme/colors"

/**
 * Named hue-rotation sets for color harmony generation.
 * Used for color picker preview and harmony visualization.
 *
 * Delegates to the domain's single `generateHarmony` (see
 * packages/domain/theme/src/color/harmony.ts) rather than rotating hues
 * independently — this module and `shade-generation.tsx::getHarmonies` used
 * to implement divergent, non-gamut-fit geometry (finding #5/#12 in the
 * color-system repair). The seed's own hue (offset 0) is left out of
 * `colors`, matching this function's existing shipped contract — callers
 * already render the seed itself separately.
 */
export interface ColorHarmonyResult {
  type: ColorHarmony
  name: string
  description: string
  colors: Oklch[]
}

function colorsExcludingSeed(
  base: Oklch,
  type: Exclude<ColorHarmony, "monochromatic">
): Oklch[] {
  const offsets = HARMONY_HUE_OFFSETS[type]
  const colors = generateHarmony(base, type)
  return offsets
    .map((offset, i) => ({ offset, color: colors[i]! }))
    .filter((entry) => entry.offset !== 0)
    .map((entry) => entry.color)
}

export function getColorHarmonies(base: Oklch): ColorHarmonyResult[] {
  return [
    {
      type: "complementary",
      name: "Complementary",
      description: "Opposite on the wheel — high contrast pair",
      colors: colorsExcludingSeed(base, "complementary"),
    },
    {
      type: "analogous",
      name: "Analogous",
      description: "Adjacent hues — harmonious and cohesive",
      // Existing shipped contract: [+30, -30] order (positive offset first).
      colors: [...colorsExcludingSeed(base, "analogous")].reverse(),
    },
    {
      type: "triadic",
      name: "Triadic",
      description: "Three hues evenly spaced — vibrant and balanced",
      colors: colorsExcludingSeed(base, "triadic"),
    },
    {
      type: "split-complementary",
      name: "Split Complement",
      description: "Complement split — less tension, more variety",
      colors: colorsExcludingSeed(base, "split-complementary"),
    },
    {
      // Square: four hues at even 90° intervals.
      type: "tetradic",
      name: "Tetradic",
      description: "Four hues at 90° intervals — rich and evenly spaced",
      colors: colorsExcludingSeed(base, "tetradic"),
    },
    {
      type: "square",
      name: "Square",
      description: "Four evenly spaced hues — balanced and energetic",
      colors: colorsExcludingSeed(base, "square"),
    },
    {
      // Rectangle: two complementary pairs, offset so one axis stays dominant.
      type: "rectangle",
      name: "Rectangle",
      description: "Two complementary pairs — complex but balanced",
      colors: colorsExcludingSeed(base, "rectangle"),
    },
    {
      type: "double-split-complementary",
      name: "Double Split Complementary",
      description: "Two nearby pairs around the complement — nuanced contrast",
      colors: colorsExcludingSeed(base, "double-split-complementary"),
    },
    {
      type: "monochromatic",
      name: "Monochromatic",
      description: "One hue across lightness — focused and cohesive",
      colors: generateHarmony(base, "monochromatic"),
    },
  ]
}
