import type { AppearancePreference, ResolvedColorScheme } from "../types"

// ---------------------------------------------------------------------------
// Pure resolution
//
// `resolveColorScheme` never reads global/browser state itself; the current
// system match state is always supplied by the caller. This keeps the
// function synchronous, deterministic, and trivially testable. Callers that
// need a live system reading should call `getSystemColorScheme()` (or
// subscribe to `matchMedia` changes directly) and pass the result in.
// ---------------------------------------------------------------------------

export function resolveColorScheme(
  preference: AppearancePreference,
  systemMatches: boolean
): ResolvedColorScheme {
  if (preference === "system") {
    return systemMatches ? "dark" : "light"
  }
  return preference
}

/**
 * Reads the current system color scheme via
 * `matchMedia('(prefers-color-scheme: dark)')`.
 *
 * Falls back to `'light'` when `matchMedia` is unavailable (SSR, older
 * browsers) or throws (some sandboxed/restricted environments).
 */
export function getSystemColorScheme(): ResolvedColorScheme {
  try {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return "light"
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  } catch {
    return "light"
  }
}
