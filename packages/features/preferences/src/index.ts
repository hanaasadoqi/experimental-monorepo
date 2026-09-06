/**
 * `@repo/features-preferences` — preferences feature layer.
 *
 * Orchestration and high-level operations across preferences.
 *
 * Provides:
 *   - PreferencesManager: Atomic batch operations, validation
 *   - PreferencesReset: Reset to defaults with flexible options
 *   - PreferencesSerializer: Import/export snapshots to JSON
 *   - Types for preference operations and change events
 *
 * Composes: domain (types) + runtime (hooks) + ui (components)
 *
 * This layer is pure (no React, no Next.js, no browser APIs).
 * See `.docs/architecture-boundaries.md`.
 */

// Types & interfaces
export type {
  UserPreferences,
  PreferencesChangeEvent,
  PreferencesResetOptions,
  PreferencesSnapshot,
  PreferenceValidationResult,
} from "./model"

// Managers & utilities
export { PreferencesManager } from "./preferences-manager"
export { PreferencesReset } from "./preferences-reset"
export { PreferencesSerializer } from "./preferences-serializer"
