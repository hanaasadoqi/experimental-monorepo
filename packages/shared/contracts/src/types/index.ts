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
export type { LoginMethod, AuthProvider } from "./auth.js"

export type { ValidationError } from "../utils/schema-utils.js"

export type TypeGuard<T> = (value: unknown) => value is T
