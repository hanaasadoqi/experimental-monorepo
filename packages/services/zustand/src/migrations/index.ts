/**
 * Schema migration utilities for versioned state.
 * Enables safe upgrades when store schema changes.
 */

/**
 * Single migration function from one version to the next.
 * Should be a pure function that transforms state from version N to N+1.
 */
export type Migration<T = unknown> = (state: T) => T

/**
 * Versioned state wrapper with metadata.
 */
export interface VersionedState<T> {
  version: number
  state: T
  _meta?: {
    migratedAt?: string
    fromVersion?: number
  }
}

/**
 * Configuration for a migration from one version to the next.
 */
export interface MigrationDefinition {
  fromVersion: number
  toVersion: number
  migrate: Migration
  description?: string
}

/**
 * Migration plan with all available migrations.
 */
export class MigrationPlan {
  private migrations: Map<string, Migration> = new Map()
  private maxVersion: number = 0

  constructor(definitions: MigrationDefinition[]) {
    for (const def of definitions) {
      if (def.toVersion > this.maxVersion) {
        this.maxVersion = def.toVersion
      }
      const key = `${def.fromVersion}->${def.toVersion}`
      this.migrations.set(key, def.migrate)
    }
  }

  /**
   * Get the current max version this plan supports.
   */
  getMaxVersion(): number {
    return this.maxVersion
  }

  /**
   * Check if a migration path exists.
   */
  canMigrate(fromVersion: number, toVersion: number): boolean {
    if (fromVersion >= toVersion) return false

    for (let v = fromVersion; v < toVersion; v++) {
      const key = `${v}->${v + 1}`
      if (!this.migrations.has(key)) {
        return false
      }
    }
    return true
  }

  /**
   * Execute migrations from one version to another.
   * @throws Error if migration path doesn't exist
   */
  migrate<T>(state: T, fromVersion: number, toVersion: number): T {
    if (fromVersion === toVersion) return state
    if (fromVersion > toVersion) {
      throw new Error(
        `Cannot migrate backwards: ${fromVersion} -> ${toVersion}`
      )
    }

    let current = state
    for (let v = fromVersion; v < toVersion; v++) {
      const key = `${v}->${v + 1}`
      const migrationFn = this.migrations.get(key)

      if (!migrationFn) {
        throw new Error(`No migration available from version ${v} to ${v + 1}`)
      }

      try {
        current = migrationFn(current) as T
      } catch (error: unknown) {
        throw new Error(
          `Migration failed from v${v} to v${v + 1}: ${error instanceof Error ? error.message : String(error)}`,
          { cause: error }
        )
      }
    }

    return current
  }
}

/**
 * Helper to create a migration plan from definitions.
 */
export const createMigrationPlan = (
  definitions: MigrationDefinition[]
): MigrationPlan => {
  return new MigrationPlan(definitions)
}

/**
 * Wrap versioned state with metadata.
 */
export const createVersionedState = <T>(
  state: T,
  version: number,
  meta?: VersionedState<T>["_meta"]
): VersionedState<T> => {
  return {
    version,
    state,
    _meta: {
      migratedAt: new Date().toISOString(),
      ...meta,
    },
  }
}

/**
 * Extract state from versioned wrapper.
 */
export const extractState = <T>(
  versionedState: VersionedState<T> | T | unknown
): T => {
  if (
    versionedState &&
    typeof versionedState === "object" &&
    "state" in versionedState &&
    "version" in versionedState
  ) {
    return (versionedState as VersionedState<T>).state
  }
  return versionedState as T
}

/**
 * Get version from versioned state.
 */
export const getVersion = (state: unknown): number => {
  if (
    state &&
    typeof state === "object" &&
    "version" in state &&
    typeof state.version === "number"
  ) {
    return state.version
  }
  return 0
}
