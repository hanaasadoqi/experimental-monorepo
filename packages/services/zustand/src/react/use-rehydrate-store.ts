import { useEffect } from "react"
import { rehydrateStore } from "../hydration/index.js"
import type { PersistedStoreLike } from "../persist/types.js"

export function useRehydrateStore(store: PersistedStoreLike): void {
  useEffect(() => {
    void rehydrateStore(store)
  }, [store])
}
