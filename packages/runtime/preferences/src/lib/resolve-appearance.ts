import type { AppearancePreference } from "@repo/domain-preferences"

/**
 * Resolve an appearance preference to a boolean darkMode state.
 *
 * Conversion:
 * - "light" → false
 * - "dark" → true
 * - "system" → check prefers-color-scheme media query (defaults to undefined if unavailable)
 *
 * @param appearance The user's appearance preference
 * @returns boolean | undefined (true = dark, false = light, undefined = unknown)
 *
 * @example
 * const isDark = resolveAppearanceToDarkMode("dark") // true
 * const isLight = resolveAppearanceToDarkMode("light") // false
 * const system = resolveAppearanceToDarkMode("system") // checks matchMedia
 */
export function resolveAppearanceToDarkMode(
  appearance: AppearancePreference
): boolean | undefined {
  if (appearance === "light") return false
  if (appearance === "dark") return true
  if (appearance === "system") {
    // Check if we're in browser environment
    if (typeof window !== "undefined" && window.matchMedia) {
      try {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
      } catch {
        // Fallback if matchMedia throws (e.g., old browsers, edge environments)
        return undefined
      }
    }
    return undefined
  }
  return undefined
}

/**
 * Resolve an appearance preference to a concrete "light" | "dark" mode.
 *
 * Conversion:
 * - "light" → "light"
 * - "dark" → "dark"
 * - "system" → systemMode (the caller's system preference)
 *
 * @param appearance The user's appearance preference
 * @param systemMode The system's current appearance ("light" or "dark")
 * @returns "light" | "dark" (the actual mode to render)
 *
 * @example
 * const mode = resolveModeFromAppearancePreference("dark", "light") // "dark"
 * const mode = resolveModeFromAppearancePreference("system", "dark") // "dark"
 *
 * M3 FIX: Validates systemMode parameter is correct before using.
 */
export function resolveModeFromAppearancePreference(
  appearance: AppearancePreference,
  systemMode: "light" | "dark"
): "light" | "dark" {
  if (appearance === "system") {
    // M3 FIX: Ensure systemMode is valid before returning
    if (systemMode !== "light" && systemMode !== "dark") {
      console.warn(`Invalid systemMode: ${systemMode}, defaulting to "light"`)
      return "light"
    }
    return systemMode
  }
  return appearance
}
