import { useStore } from "zustand"
import type { StoreApi } from "zustand/vanilla"

export function createStoreHook<TState>(useStoreApi: () => StoreApi<TState>) {
  return function useScopedStore<TSelected>(selector: (state: TState) => TSelected): TSelected {
    return useStore(useStoreApi(), selector)
  }
}
