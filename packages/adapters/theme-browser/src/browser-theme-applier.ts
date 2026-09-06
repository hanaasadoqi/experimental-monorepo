/**
 * Browser implementation of ThemeApplier port.
 * Applies theme to document via CSS variables and attributes.
 */

export type ThemeMode = "light" | "dark"

/**
 * Apply appearance to document root.
 * Sets className and data-theme attribute.
 */
export function applyAppearanceToDocument(appearance: ThemeMode): void {
  if (typeof document === "undefined") return

  const root = document.documentElement
  root.className = appearance
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
  overrides: {
    isDarkMode?: boolean
    primaryColor?: string
  }
): void {
  if (overrides.isDarkMode !== undefined) {
    element.setAttribute(
      "data-scope-dark-mode",
      overrides.isDarkMode ? "true" : "false"
    )
  }

  if (overrides.primaryColor) {
    element.style.setProperty("--scope-primary-color", overrides.primaryColor)
  }
}
