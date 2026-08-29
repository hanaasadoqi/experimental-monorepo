/**
 * Contract for persisting store state to external storage.
 */
export interface PersistenceAdapter<T> {
  /**
   * Read state from storage. Return undefined if not found.
   */
  read(): T | undefined

  /**
   * Write state to storage.
   */
  write(state: T): void

  /**
   * Listen for external changes to storage (e.g., storage events, cookie changes).
   * Return unsubscribe function.
   */
  subscribe(listener: () => void): () => void
}
