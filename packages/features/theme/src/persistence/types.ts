import type { AppearancePreference } from "../types"

// ---------------------------------------------------------------------------
// Persistence adapter contract
//
// An `AppearancePersistenceAdapter` is a pluggable storage backend for the
// user's appearance preference. All adapters (localStorage, cookies, and any
// future backend) satisfy this same interface and the shared contract test
// in `adapter.contract.test.ts`, so callers can swap backends without
// changing behavior.
// ---------------------------------------------------------------------------

export interface AppearancePersistenceAdapter {
  /**
   * Reads the currently persisted preference. Returns `null` when nothing is
   * persisted, when the persisted value fails validation, or when the
   * underlying storage is unavailable (e.g. server-side rendering, private
   * browsing with storage disabled).
   */
  read(): AppearancePreference | null

  /**
   * Persists a preference. Must never throw; failures (e.g. storage quota,
   * unavailable storage) are swallowed so callers can call this
   * unconditionally.
   */
  write(preference: AppearancePreference): void

  /**
   * Subscribes to preference changes that originate outside this adapter
   * instance (e.g. another browser tab). Writes made via this adapter's own
   * `write()` must not trigger the listener. Returns an idempotent
   * unsubscribe function.
   */
  subscribe(listener: (preference: AppearancePreference) => void): () => void
}

export const APPEARANCE_PREFERENCES = ["light", "dark", "system"] as const
