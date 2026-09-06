/**
 * `@repo/runtime-preferences` — preferences runtime layer (React + Zustand).
 *
 * React only, no Next.js, no implementation beyond state/hooks.
 * See `.docs/architecture-boundaries.md`.
 *
 * Manages preferences state via Zustand and exports React hooks:
 *
 *   store/
 *     - createPreferencesStore()     Create a Zustand store instance
 *     - PreferencesStore type        Appearance + language + setters
 *
 *   context/
 *     - PreferencesProvider          Context provider component
 *     - usePreferencesStore()        Access full store state
 *     - useAppearancePreference()    Query appearance preference
 *     - useSetAppearancePreference() Update appearance preference
 *     - useLanguagePreference()      Query language preference
 *     - useSetLanguagePreference()   Update language preference
 *
 * Import from: @repo/runtime-preferences only.
 *
 * Consumers: @repo/ui-preferences, @repo/features-preferences, app pages
 */
export * from "./store"
export * from "./context"
