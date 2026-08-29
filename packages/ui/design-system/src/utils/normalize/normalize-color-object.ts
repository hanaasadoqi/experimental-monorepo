import {
  ColorTokens,
  ColorVariantKey,
  ResolvedAppearance,
} from "../../tokens/colors"

export function normalizeColorObject(
  obj: ColorTokens,
  prefix: ColorVariantKey,
  resolvedAppearance: ResolvedAppearance
): Record<string, string> {
  const normalizedColorTokens: Record<string, string> = {}
  const colorScale = obj[prefix].scale
  const semanticVars = obj[prefix].semanticVars
  for (const [key, value] of Object.entries(colorScale)) {
    normalizedColorTokens[`--${prefix}-${key}`] = value
  }

  for (const [key, value] of Object.entries(semanticVars)) {
    if (key === "DEFAULT") {
      normalizedColorTokens[`--${prefix}`] = value as string
    } else {
      if (key !== "dark" && key !== "light") continue
      normalizedColorTokens[`--${prefix}-foreground`] =
        obj[prefix].semantic[
          resolvedAppearance as ResolvedAppearance
        ].foreground
      normalizedColorTokens[`--${prefix}-background`] =
        obj[prefix].semantic[
          resolvedAppearance as ResolvedAppearance
        ].background
    }
  }
  return normalizedColorTokens
}
