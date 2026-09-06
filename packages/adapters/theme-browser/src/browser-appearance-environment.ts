/**
 * Browser implementation of AppearanceEnvironment port.
 * Reads system dark mode preference via matchMedia.
 */

export type AppearanceEnvironment = "light" | "dark"

/**
 * Detect current system appearance preference.
 * Returns immediately with current state; does not listen for changes.
 * Falls back to "light" if matchMedia is unavailable.
 */
export function detectSystemAppearance(): AppearanceEnvironment {
  if (typeof window === "undefined") return "light"

  // Feature detection for matchMedia and prefers-color-scheme
  if (!window.matchMedia) return "light"

  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  } catch {
    // Fallback if matchMedia fails to parse the query
    return "light"
  }
}

/**
 * Subscribe to system appearance changes.
 * Returns unsubscribe function.
 * No-op if matchMedia is unavailable.
 * Includes error handling to prevent silent failures.
 */
export function subscribeToSystemAppearanceChanges(
  callback: (appearance: AppearanceEnvironment) => void
): () => void {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {} // No-op unsubscribe
  }

  try {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e: MediaQueryListEvent) => {
      try {
        callback(e.matches ? "dark" : "light")
      } catch (err) {
        console.error("Appearance callback error:", err)
      }
    }

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  } catch (err) {
    console.warn("Failed to subscribe to system appearance changes:", err)
    return () => {} // No-op if subscription fails, but logged
  }
}
