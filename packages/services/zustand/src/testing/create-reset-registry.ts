export interface StoreResetRegistry {
  register(reset: () => void): () => void
  resetAll(): void
  clear(): void
  readonly size: number
}

export function createResetRegistry(): StoreResetRegistry {
  const resetters = new Set<() => void>()

  return {
    register(reset) {
      resetters.add(reset)
      return () => resetters.delete(reset)
    },
    resetAll() {
      for (const reset of resetters) reset()
    },
    clear() {
      resetters.clear()
    },
    get size() {
      return resetters.size
    },
  }
}

export const storeResetRegistry = createResetRegistry()
