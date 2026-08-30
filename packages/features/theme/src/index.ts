export type { ResolvedAppearance } from "./model"

export { resolveAppearance } from "./resolution"

export { applyAppearance, generateBootstrapCode } from "./runtime"

export {
  AppearanceRuntimeProvider,
  useResolvedAppearance,
  useSystemAppearance,
  ThemeToggleHotkey,
  isTypingTarget,
} from "./react"

export type { AppearanceRuntimeProviderProps } from "./react"
