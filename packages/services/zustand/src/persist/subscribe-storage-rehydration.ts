import type { StorageEventTargetLike, StoragePersistedStoreLike } from "./types"

export function subscribeToStorageRehydration(
  store: StoragePersistedStoreLike,
  target: StorageEventTargetLike = window,
): () => void {
  const storageKey = store.persist.getOptions().name

  const handleStorage = (event: { key: string | null; newValue: string | null }): void => {
    if (event.key !== storageKey || event.newValue === null) return
    void store.persist.rehydrate()
  }

  target.addEventListener("storage", handleStorage)
  return () => target.removeEventListener("storage", handleStorage)
}
