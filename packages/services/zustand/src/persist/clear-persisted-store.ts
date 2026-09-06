import type { StoragePersistedStoreLike } from "./types"

export async function clearPersistedStore(
  store: StoragePersistedStoreLike
): Promise<void> {
  await store.persist.clearStorage?.()
}
