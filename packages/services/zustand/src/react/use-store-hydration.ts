"use client"

import { useSyncExternalStore } from "react"
import { isStoreHydrated, subscribeToHydration } from "../hydration/index"
import type { PersistedStoreLike } from "../persist/types"

export function useStoreHydration(store: PersistedStoreLike): boolean {
  return useSyncExternalStore(
    (onStoreChange) => subscribeToHydration(store, () => onStoreChange()),
    () => isStoreHydrated(store),
    () => false
  )
}
