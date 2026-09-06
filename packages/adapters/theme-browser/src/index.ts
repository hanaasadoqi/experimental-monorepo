// Appearance environment (system preference detection)
export {
  detectSystemAppearance,
  subscribeToSystemAppearanceChanges,
} from "./browser-appearance-environment"
export type { AppearanceEnvironment } from "./browser-appearance-environment"

// Theme application (DOM manipulation)
export {
  applyAppearanceToDocument,
  applyThemeCSSVariablesToDocument,
  clearThemeCSSVariables,
  applyScopeThemeToElement,
} from "./browser-theme-applier"
export type { ThemeMode } from "./browser-theme-applier"
