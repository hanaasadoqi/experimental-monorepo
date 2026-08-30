import type { StoragePersistedStoreLike } from "./types.js"

export async function clearPersistedStore(store: StoragePersistedStoreLike): Promise<void> {
  await store.persist.clearStorage?.()
}
