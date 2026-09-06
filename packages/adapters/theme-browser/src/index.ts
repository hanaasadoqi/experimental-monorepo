// Appearance environment (system preference detection)
export {
  detectSystemAppearance,
  subscribeToSystemAppearanceChanges,
} from "./browser-appearance-environment"
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
