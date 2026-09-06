import type { Preferences } from "./model"

/**
 * Preferences change event.
 * Fired when any preference changes.
 */
export interface PreferencesChangeEvent {
  key: keyof Preferences
  type: "appearance" | "language" | "date-format" | "time-format"
  previous: string | boolean
  current: string | boolean
  timestamp: number
}
