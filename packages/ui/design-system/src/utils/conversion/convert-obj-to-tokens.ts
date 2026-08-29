import {
  ColorTokens,
  ColorVariantKey,
  ResolvedAppearance,
} from "../../tokens/colors"
import { normalizeColorObject } from "../normalize/normalize-color-object"

export function convertObjToTokens(
  obj: Record<string, any>,
  prefix = "",
  resolvedAppearance: ResolvedAppearance,
  type = "colors"
): Map<string, string> {
  const tokens = new Map<string, string>()

  if (type === "colors") {
    normalizeColorObject(
      obj as ColorTokens,
      prefix as ColorVariantKey,
      resolvedAppearance
    )
  }

  for (const [key, value] of Object.entries(obj)) {
    const tokenKey = prefix ? `${prefix}-${key}` : key

    if (typeof value === "object" && value !== null) {
      for (const [k, v] of convertObjToTokens(
        value,
        tokenKey,
        resolvedAppearance,
        type
      )) {
        tokens.set(k, v)
      }
    } else {
      tokens.set(tokenKey, value)
    }
  }

  return tokens
}
