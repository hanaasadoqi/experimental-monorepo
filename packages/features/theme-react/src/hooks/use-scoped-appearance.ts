import { useEffect } from "react"
import type { ThemeScopeStoreApi } from "@repo/runtime-theme"
import { applyAppearance } from "@repo/runtime-theme"
import type { ThemeMode } from "@repo/domain-theme/appearance"

/**
 * Hook to apply scoped dark mode overrides to a DOM element.
 * When isDarkModeEnabled is set, applies dark mode to the element regardless of root theme.
 * When undefined, inherits from document.documentElement.
 */
export function useScopedAppearance(
  scopeStore: ThemeScopeStoreApi,
  rootElement: HTMLElement | null
): void {
  useEffect(() => {
    if (!rootElement) return

    const unsubscribe = scopeStore.subscribe((state) => {
      const isDarkModeEnabled = state.isDarkModeEnabled

      if (isDarkModeEnabled === undefined) {
        rootElement.classList.remove("dark")
        rootElement.removeAttribute("data-theme")
        rootElement.style.removeProperty("color-scheme")
        return
      }

      const appearance: ThemeMode = isDarkModeEnabled ? "dark" : "light"
      applyAppearance(appearance, rootElement)
    })

    const initialDarkMode = scopeStore.getState().isDarkModeEnabled
    if (initialDarkMode !== undefined) {
      const appearance: ThemeMode = initialDarkMode ? "dark" : "light"
      applyAppearance(appearance, rootElement)
    }

    return unsubscribe
  }, [scopeStore, rootElement])
}
