import { create } from "zustand"
import type { StoreApi } from "zustand"

import type {
  AppearancePreference,
  AppearanceState,
  ResolvedColorScheme,
} from "../types"

const DEFAULT_PREFERENCE: AppearancePreference = "system"
const DEFAULT_SYSTEM_SCHEME: ResolvedColorScheme = "light"

/**
 * Pure resolution rule: given a stated preference and an explicit system
 * scheme, determine the color scheme that should actually apply.
 *
 * - 'light' and 'dark' preferences always resolve to themselves.
 * - 'system' defers to the provided systemScheme input.
 *
 * This never reads global/browser state directly; callers are responsible
 * for supplying the current system scheme.
 */
export const resolveColorScheme = (
  preference: AppearancePreference,
  systemScheme: ResolvedColorScheme
): ResolvedColorScheme => {
  if (preference === "system") {
    return systemScheme
  }
  return preference
}

/**
 * Creates a new, isolated Appearance store instance.
 *
 * @param defaultPreference - initial preference, defaults to 'system'
 * @param systemScheme - initial system color scheme used to resolve
 *   'system' preference, defaults to 'light'
 */
export const createAppearanceStore = (
  defaultPreference: AppearancePreference = DEFAULT_PREFERENCE,
  systemScheme: ResolvedColorScheme = DEFAULT_SYSTEM_SCHEME
): StoreApi<AppearanceState> => {
  return create<AppearanceState>((set) => ({
    preference: defaultPreference,
    resolvedColorScheme: resolveColorScheme(defaultPreference, systemScheme),
    setPreference: (preference: AppearancePreference) =>
      set(() => ({
        preference,
        resolvedColorScheme: resolveColorScheme(preference, systemScheme),
      })),
  }))
}

/**
 * Legacy singleton for backward compatibility, created once at module
 * load. Not yet re-exported from the package root (Task 9 handles public
 * exports).
 */
export const themeStore = createAppearanceStore()
