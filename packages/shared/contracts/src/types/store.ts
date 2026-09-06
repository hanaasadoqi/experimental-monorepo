import type { StateCreator, StoreApi, UseBoundStore } from "zustand"
import type { Theme } from "@repo/domain-theme"

type Store<T> = UseBoundStore<StoreApi<T>>

type StoreCreator<T> = StateCreator<T, [], []>

/**
 * Selector function that extracts a value from state.
 */
type Selector<T, U> = (state: T) => U

/**
 * Slice creator function.
 * Takes a Zustand set/get/store and returns a slice of state.
 */
type SliceCreator<T, U> = (
  set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
  get: () => T,
  api: StoreApi<T>
) => unknown & U

type SliceState<T> = T extends SliceCreator<infer S, unknown> ? S : never

/**
 * Type-safe slice extractor.
 * Extracts typed slice from the full store state.
 */
type SliceExtractor<T, K extends keyof T> = (state: T) => T[K]

/**
 * Theme store contract: state and actions for theme management.
 * Used by @repo/runtime-theme and integrated with @repo/features-preferences.
 * This contract can safely import from @repo/domain-theme since domain-theme has no external dependencies.
 */
type ThemeState = {
  /**
   * Themes map: theme ID -> Theme instance.
   */
  themes: Record<string, Theme>
}

type ThemeActions = {
  /**
   * Get a theme by ID.
   * @returns Theme instance or undefined if not found
   */
  getTheme: (id: string) => Theme | undefined
  /**
   * Get the global/root theme.
   * @returns Root Theme instance
   */
  getGlobalTheme: () => Theme
  /**
   * Set dark mode state for the global theme.
   * @param darkMode - Boolean or undefined (undefined = unresolved/system)
   */
  setGlobalThemeDarkMode: (darkMode: boolean | undefined) => void
  /**
   * Toggle dark mode for the global theme.
   */
  toggleTheme: () => void
}

type ThemeStore = ThemeState & ThemeActions

export type {
  StateCreator,
  StoreApi,
  UseBoundStore,
  Store,
  Selector,
  StoreCreator,
  SliceCreator,
  SliceState,
  SliceExtractor,
  ThemeState,
  ThemeActions,
  ThemeStore,
}
