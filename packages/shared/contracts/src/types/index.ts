/**
 * @fileoverview TypeScript types and inferred types from schemas.
 * This is the public types directory. Re-exported through @repo/contracts main index.
 */

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
export type { ThemeColor, Theme } from "./theme.js"
export type { LoginMethod, AuthProvider } from "./auth.js"
export type {
  PersistenceAdapter,
  PersistenceConfig,
  CookieAdapterOptions,
  SameSiteOptions,
} from "./storage.js"
export type {
  ResolvedAppearance,
  AppearanceSource,
  SavedAppearancePreference,
  UserPreferences,
} from "./preference.js"

// Utility types
export type { ValidationError } from "../utils/schema-utils.js"

export type TypeGuard<T> = (value: unknown) => value is T
