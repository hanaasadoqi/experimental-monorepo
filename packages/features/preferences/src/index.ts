export { createPreferencesStore } from "./store"
export type {
  AppearancePreference,
  PreferencesState,
} from "@repo/shared-contracts/types/domain.js"
export { PreferencesProvider, usePreferencesStore } from "./provider"
export {
  useAppearancePreference,
  usePreferences,
  useSetAppearancePreference,
} from "./hooks"
export {
  createCookiePreferencesAdapter,
  createLocalStoragePreferencesAdapter,
} from "./persistence"
export type {
  CookiePreferencesAdapterOptions,
  PreferencesPersistenceAdapter,
} from "./persistence"
