import type { StoreMigrations } from "./types"

export function createSequentialMigration<TState>(migrations: StoreMigrations<TState>) {
  const versions = Object.keys(migrations)
    .map(Number)
    .sort((a, b) => a - b)

  return async (persistedState: unknown, persistedVersion: number): Promise<TState> => {
    let state: unknown = persistedState

    for (const version of versions) {
      if (version <= persistedVersion) continue
      const migrate = migrations[version]
      if (!migrate) continue
      state = await migrate(state)
    }

    return state as TState
  }
}
