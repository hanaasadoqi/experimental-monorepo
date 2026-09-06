/**
 * Browser implementation of AppearanceEnvironment port.
 * Reads system dark mode preference via matchMedia.
 */

export type AppearanceEnvironment = "light" | "dark"

/**
 * Detect current system appearance preference.
 * Returns immediately with current state; does not listen for changes.
 */
export function detectSystemAppearance(): AppearanceEnvironment {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

/**
 * Subscribe to system appearance changes.
 * Returns unsubscribe function.
 */
export function subscribeToSystemAppearanceChanges(
  callback: (appearance: AppearanceEnvironment) => void
): () => void {
  if (typeof window === "undefined") return () => {}

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? "dark" : "light")
  }

  mediaQuery.addEventListener("change", handler)
  return () => mediaQuery.removeEventListener("change", handler)
}
