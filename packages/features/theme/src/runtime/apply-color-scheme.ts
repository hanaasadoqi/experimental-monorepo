import type { ResolvedColorScheme } from "../types"

// ---------------------------------------------------------------------------
// Pure DOM application
//
// `applyColorScheme` is the single place that writes the resolved color
// scheme to the DOM. All three properties below are derived from the same
// `scheme` argument and updated together so they can never disagree:
//
//   - the `.dark` class (Tailwind's `darkMode: 'class'` strategy)
//   - the `data-theme` attribute (CSS attribute selectors, debugging)
//   - the inline `color-scheme` CSS property (native form controls,
//     scrollbars, etc.)
// ---------------------------------------------------------------------------

const DARK_CLASS = "dark"
const DATA_THEME_ATTRIBUTE = "data-theme"

export function applyColorScheme(
  element: HTMLElement,
  scheme: ResolvedColorScheme
): void {
  const isDark = scheme === "dark"

  element.classList.toggle(DARK_CLASS, isDark)
  element.setAttribute(DATA_THEME_ATTRIBUTE, scheme)
  element.style.colorScheme = scheme
}

/**
 * Reads back the color scheme currently applied to `element`, via the
 * `data-theme` attribute. Defaults to `'light'` when the attribute is
 * missing or holds an unrecognized value.
 */
export function getAppliedColorScheme(
  element: HTMLElement
): ResolvedColorScheme {
  return element.getAttribute(DATA_THEME_ATTRIBUTE) === "dark"
    ? "dark"
    : "light"
}
