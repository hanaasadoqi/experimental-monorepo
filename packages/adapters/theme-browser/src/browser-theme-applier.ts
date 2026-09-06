/**
 * Browser implementation of ThemeApplier port.
 * Applies theme to document via CSS variables and attributes.
 */

import type { ResolvedAppearancePreference } from "@repo/domain-preferences"

export interface ScopeThemeOverrides {
  isDarkMode?: boolean
  primaryColor?: string
}

/**
 * Apply appearance to document root.
 * Toggles only the classes owned by appearance so application and font classes
 * on the root element remain intact.
 */
export function applyAppearanceToDocument(
  appearance: ResolvedAppearancePreference
): void {
  if (typeof document === "undefined") return

  const root = document.documentElement
  root.classList.toggle("dark", appearance === "dark")
  root.classList.toggle("light", appearance === "light")
  root.setAttribute("data-theme", appearance)
  root.style.colorScheme = appearance
}

/**
 * Apply theme CSS variables to document.
 * Merges with existing styles.
 */
export function applyThemeCSSVariablesToDocument(
  variables: Record<string, string>
): void {
  if (typeof document === "undefined") return

  const root = document.documentElement
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}

/**
 * Clear theme CSS variables from document.
 */
export function clearThemeCSSVariables(keys: string[]): void {
  if (typeof document === "undefined") return

  const root = document.documentElement
  keys.forEach((key) => {
    root.style.removeProperty(key)
  })
}

/**
 * Apply scoped theme overrides to a specific DOM element.
 */
export function applyScopeThemeToElement(
  element: HTMLElement,
  overrides: ScopeThemeOverrides
): void {
  if (overrides.isDarkMode !== undefined) {
    element.classList.toggle("dark", overrides.isDarkMode)
    element.classList.toggle("light", !overrides.isDarkMode)
    element.setAttribute(
      "data-scope-dark-mode",
      overrides.isDarkMode ? "true" : "false"
    )
  } else {
    element.classList.remove("dark", "light")
    element.removeAttribute("data-scope-dark-mode")
  }

  if (overrides.primaryColor) {
    element.style.setProperty("--primary", overrides.primaryColor)
  } else {
    element.style.removeProperty("--primary")
  }
}
