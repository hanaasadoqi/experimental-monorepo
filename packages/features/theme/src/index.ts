export type { ResolvedAppearance } from "./model/appearance"
export {
  oklchStrSchema,
  oklchColorSchema,
  lmsColorSchema,
  colorScaleSchema,
  colorHarmonySchema,
  semanticColorNameSchema,
  semanticColorOverridesSchema,
  OKLCH_REGEX,
  MIN_LIGHTNESS,
  MAX_LIGHTNESS,
  MIN_CHROMA,
  MAX_CHROMA,
  MIN_HUE,
  MAX_HUE,
  CONTRAST_THRESHOLDS,
} from "./model/color"
export type {
  oklchColor,
  OklchColor,
  OklchString,
  OklchStr,
  lmsColor,
  ColorScaleStep,
  ColorScale,
  ColorHarmony,
  SemanticColorName,
  SemanticColorOverrides,
  HexColor,
} from "./model/color"

export { resolveAppearance } from "./resolution"

export { applyAppearance, generateBootstrapCode } from "./runtime"

export {
  AppearanceRuntimeProvider,
  ThemeForm,
  ThemePreview,
  ThemeScopeProvider,
  useThemeScopeStore,
  useResolvedAppearance,
  useSystemAppearance,
  ThemeToggleHotkey,
  isTypingTarget,
} from "./react"

export type {
  AppearanceRuntimeProviderProps,
  ThemeScopeProviderProps,
} from "./react"

export { createThemeScopeStore, getThemeScopeStorageKey } from "./store/index"

export type {
  CreateThemeScopeStoreOptions,
  ThemeScopeActions,
  ThemeScopeState,
  ThemeScopeStore,
  ThemeScopeStoreApi,
} from "./store"
