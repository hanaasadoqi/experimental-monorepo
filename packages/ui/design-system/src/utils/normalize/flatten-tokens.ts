/**
 * Convert flat or nested token objects to CSS custom properties
 */
interface TokenMap {
  [key: string]: string | TokenMap
}

type TokenValue = string | TokenMap

export function flattenTokens(
  obj: Record<string, TokenValue>,
  prefix = ""
): Record<string, string> {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(obj)) {
    const cssKey = prefix ? `${prefix}-${key}` : key
    if (typeof value === "string") {
      result[cssKey] = value
    } else if (typeof value === "object" && value !== null) {
      Object.assign(
        result,
        flattenTokens(value as Record<string, TokenValue>, cssKey)
      )
    }
  }

  return result
}
