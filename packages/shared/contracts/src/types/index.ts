/**
 * @fileoverview TypeScript types and inferred types from schemas.
 * This is the public types directory. Re-exported through @repo/contracts main index.
 */

// Core domain types
export type {
  AppearanceMode,
  AppearancePreference,
  Theme,
  ThemeColor,
  UserPreferences,
  ThemeAppearance,
  ThemeForm,
  PersistenceAdapter,
  PersistenceConfig,
} from "./domain.js"

// Form types
export type { LoginForm } from "./forms.js"

// Schema-inferred types (for backwards compatibility and detailed imports)
export type { ThemeOklchColor, PreferencesState } from "../schemas/index.js"

// Utility types
export type { ValidationError } from "../utils/schema-utils.js"

// Zustand types
export type {
  StateCreator,
  StoreApi,
  UseBoundStore,
  Store,
  StoreCreator,
  SliceCreator,
  SliceState,
  SliceExtractor,
  Selector,
} from "./store.js"
