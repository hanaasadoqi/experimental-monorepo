"use client"

import { useEffect } from "react"
import { rehydrateStore } from "../hydration/index"
import type { PersistedStoreLike } from "../persist/types"

export function useRehydrateStore(store: PersistedStoreLike): void {
  useEffect(() => {
    void rehydrateStore(store)
  }, [store])
}
