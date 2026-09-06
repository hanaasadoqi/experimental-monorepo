import { preferencesSchema } from "@repo/domain-preferences"

import type {
  PreferencesSnapshot,
  UserPreferences,
  SnapshotRestorationResult,
} from "./model"

export type { PreferencesSnapshot }

/**
 * Version handler interface.
 * Each snapshot version has a handler that migrates
 * its data to the current Preferences type.
 */
interface SnapshotVersionHandler {
  /**
   * Migrate snapshot data to current Preferences format.
   * @param data - The preferences object from the snapshot
   * @returns Validated Preferences or null if migration fails
   */
  migrate(data: unknown): UserPreferences | null
}

/**
 * Version 1.0 handler.
 * Current format: direct preferences object with no transformations.
 */
const SNAPSHOT_VERSION_1_0: SnapshotVersionHandler = {
  migrate(data: unknown): UserPreferences | null {
    if (!data || typeof data !== "object") {
      return null
    }

    // Use Zod schema to validate and ensure type safety
    const result = preferencesSchema.safeParse(data)
    return result.success ? result.data : null
  },
}

/**
 * Version handlers registry.
 * Maps version strings to their migration handlers.
 * Add new versions here as they're created.
 */
const SNAPSHOT_HANDLERS: Record<string, SnapshotVersionHandler> = {
  "1.0": SNAPSHOT_VERSION_1_0,
  // Future versions:
  // "2.0": SNAPSHOT_VERSION_2_0,
  // "3.0": SNAPSHOT_VERSION_3_0,
}

/**
 * Preferences import/export utilities.
 *
 * Supports serializing preferences to JSON snapshots
 * and restoring from exported snapshots.
 *
 * Useful for:
 * - Backing up user preferences
 * - Migrating preferences across devices
 * - Sharing preference configs
 * - Analytics and debugging
 *
 * Supports version migration: old snapshots are automatically
 * migrated to the current version via the handler registry.
 */
export class PreferencesSerializer {
  /**
   * Current snapshot version.
   * Increment when the Preferences structure changes.
   */
  static readonly CURRENT_VERSION = "1.0"

  /**
   * Export current preferences as a snapshot.
   * Requires complete preferences object (merge with defaults before calling if needed).
   * Can be stringified to JSON for storage or transmission.
   */
  static createSnapshot(preferences: UserPreferences): PreferencesSnapshot {
    return {
      version: this.CURRENT_VERSION,
      timestamp: Date.now(),
      preferences,
    }
  }

  /**
   * Restore preferences from a snapshot.
   * Automatically routes to the appropriate version handler.
   * Uses Zod schema validation to ensure type safety.
   * H4 FIX: Returns structured result with error details instead of silent nulls.
   */
  static restoreFromSnapshot(snapshot: unknown): SnapshotRestorationResult {
    if (!snapshot || typeof snapshot !== "object") {
      return {
        success: false,
        data: null,
        error: "Invalid snapshot structure: expected object",
        errorCode: "INVALID_SNAPSHOT",
      }
    }

    const obj = snapshot as Record<string, unknown>

    // Extract version
    const version = typeof obj.version === "string" ? obj.version : null
    if (!version) {
      return {
        success: false,
        data: null,
        error: "Missing version field in snapshot",
        errorCode: "MISSING_VERSION",
      }
    }

    // Look up handler for this version
    const handler = SNAPSHOT_HANDLERS[version]
    if (!handler) {
      return {
        success: false,
        data: null,
        error: `Unsupported snapshot version: ${version}. Supported versions: ${Object.keys(SNAPSHOT_HANDLERS).join(", ")}`,
        errorCode: "UNSUPPORTED_VERSION",
      }
    }

    // Extract preferences data
    if (!obj.preferences || typeof obj.preferences !== "object") {
      return {
        success: false,
        data: null,
        error: "Invalid or missing preferences field in snapshot",
        errorCode: "INVALID_PREFERENCES_DATA",
      }
    }

    // Delegate to version handler
    const preferences = handler.migrate(obj.preferences)
    if (!preferences) {
      return {
        success: false,
        data: null,
        error: `Failed to migrate snapshot version ${version}. Preferences validation failed.`,
        errorCode: "MIGRATION_FAILED",
      }
    }

    return {
      success: true,
      data: preferences,
    }
  }

  /**
   * Export preferences as JSON string.
   * Pretty-printed for readability.
   */
  static toJSON(preferences: UserPreferences): string {
    const snapshot = this.createSnapshot(preferences)
    return JSON.stringify(snapshot, null, 2)
  }

  /**
   * Parse preferences from JSON string.
   * Returns structured result with error details if parsing fails.
   */
  static fromJSON(json: string): SnapshotRestorationResult {
    try {
      const snapshot = JSON.parse(json)
      return this.restoreFromSnapshot(snapshot)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return {
        success: false,
        data: null,
        error: `Invalid JSON: ${message}`,
        errorCode: "INVALID_JSON",
      }
    }
  }

  /**
   * Restore preferences from a snapshot (legacy API for backward compatibility).
   * Returns null if restoration fails.
   * @deprecated Use restoreFromSnapshot() instead for better error details
   */
  static restoreFromSnapshotLegacy(snapshot: unknown): UserPreferences | null {
    const result = this.restoreFromSnapshot(snapshot)
    return result.data
  }
}
