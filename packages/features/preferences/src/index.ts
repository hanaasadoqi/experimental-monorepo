/**@example
 *
 * const appearance = useAppearancePreference()
 * const setAppearance = useSetAppearancePreference()
 * const appearancePref = usePreferencesStore((state) => state.appearance)
 */

export {
  appearancePreferenceSchema,
  preferencesSchema,
  DEFAULT_APPEARANCE_PREFERENCE,
  DEFAULT_PREFERENCES,
} from "./model"

export type {
  AppearancePreference,
  Preferences,
  PreferencesActions,
  PreferencesState,
} from "./model"

export {
  createPreferencesStore,
} from "./store"

export type {
  PreferencesStore,
  PreferencesStoreApi,
  CreatePreferencesStoreOptions,
} from "./store"

export {
  PreferencesProvider,
  usePreferencesStore,
  useAppearancePreference,
  useSetAppearancePreference,
} from "./react"

export type {
  PreferencesProviderProps,
} from "./react"
