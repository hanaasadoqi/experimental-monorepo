import { useSyncExternalStore } from "react"
import { isStoreHydrated, subscribeToHydration } from "../hydration/index.js"
import type { PersistedStoreLike } from "../persist/types.js"

export function useStoreHydration(store: PersistedStoreLike): boolean {
  return useSyncExternalStore(
    (onStoreChange) => subscribeToHydration(store, () => onStoreChange()),
    () => isStoreHydrated(store),
    () => false,
  )
}
