import type { PersistedStoreLike } from "../persist/types"

export function isStoreHydrated(store: PersistedStoreLike): boolean {
  return store.persist.hasHydrated()
}

export async function rehydrateStore(store: PersistedStoreLike): Promise<void> {
  await store.persist.rehydrate()
}

export function subscribeToHydration(
  store: PersistedStoreLike,
  listener: (hydrated: boolean) => void
): () => void {
  const unsubscribeStart = store.persist.onHydrate(() => listener(false))
  const unsubscribeFinish = store.persist.onFinishHydration(() =>
    listener(true)
  )

  return () => {
    unsubscribeStart()
    unsubscribeFinish()
  }
}
