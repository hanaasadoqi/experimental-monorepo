// Internals of the Appearance module.
//
// `AppearanceProvider` owns store creation and the synchronization
// lifecycle. These factories exist for advanced composition and for tests;
// application code should mount `AppearanceProvider` and read state through
// the `use*` hooks instead. Module-level singletons are intentionally not
// re-exported here.
export { createAppearanceStore, resolveColorScheme } from "./appearance-store"
export { createThemeStore, type ThemeStoreState } from "./theme-store"
