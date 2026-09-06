// Re-exports for backward compatibility
export * from "./resolution"
export * from "./runtime"
export * from "./store"
export * from "./scope"

// Compiler pipeline (Phase 2)
export { compile } from "@repo/domain-theme/compiler"
export type {
  ThemeCompilationInput,
  ThemeCompilationResult,
  ResolvedTheme,
  CssVariables,
} from "@repo/domain-theme/compiler"
