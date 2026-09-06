import type { Preferences } from "./model"

/**
 * Preferences import/export format.
 */
export interface PreferencesSnapshot {
  version: "1.0"
  timestamp: number
  preferences: Preferences
}
