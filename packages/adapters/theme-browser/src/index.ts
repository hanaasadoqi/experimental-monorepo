// Appearance environment (system preference detection)
export {
  detectSystemAppearance,
  subscribeToSystemAppearanceChanges,
} from "./browser-appearance-environment"
export { useSystemAppearance } from "./use-system-appearance"
export type { AppearanceEnvironment } from "./browser-appearance-environment"

export { getBrowserThemeStorage } from "./browser-storage"
export { generateAppearanceBootstrapCode } from "./appearance-bootstrap"

// Theme application (DOM manipulation)
export {
  applyAppearanceToDocument,
  applyThemeCSSVariablesToDocument,
  clearThemeCSSVariables,
  applyScopeThemeToElement,
} from "./browser-theme-applier"
