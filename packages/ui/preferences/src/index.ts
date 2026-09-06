/**
 * `@repo/ui-preferences` — preferences UI layer (React components).
 *
 * React components for displaying and managing user preferences.
 * See `.docs/architecture-boundaries.md`.
 *
 * Can import from: domain + runtime + ui-components (not app code).
 *
 * Implemented components:
 *
 *   - PreferencesForm        Full preferences management UI (tabbed interface)
 *   - LanguageForm           Language selection with native labels and flags
 *   - DateTimeForm           Date and time format selection
 *
 * Each component:
 *   - Uses @repo/domain-preferences types for type safety
 *   - Uses @repo/ui-components for base UI elements
 *   - Contains NO domain logic or state management
 *
 * Export public components from ./components/index.ts
 */

export { DateTimeForm, LanguageForm, PreferencesForm } from "./components/index"
