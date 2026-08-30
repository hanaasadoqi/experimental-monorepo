import type {
  StorageListenerErrorHandler,
  StorageSubscription,
  SubscribableStringStorage,
  Unsubscribe,
} from "./types.js"

export interface MemoryStorage extends SubscribableStringStorage {
  clear(): void
  entries(): ReadonlyMap<string, string>
}

export interface MemoryStorageOptions {
  initialValues?: Readonly<Record<string, string>>
}

export function createMemoryStorage(
  options: MemoryStorageOptions = {}
): MemoryStorage {
  const values = new Map(Object.entries(options.initialValues ?? {}))
  const listeners = new Map<string, Set<StorageSubscription>>()

  const notify = (key: string, value: string | null): void => {
    listeners.get(key)?.forEach((subscription) => {
      try {
        subscription.listener(value)
      } catch (error) {
        try {
          subscription.onError(error)
        } catch {
          // Error reporters are isolated so observer failures cannot change the
          // result of a storage mutation that has already completed.
        }
      }
    })
  }

  return {
    getItem(key) {
      return values.get(key) ?? null
    },

    setItem(key, value) {
      if (values.get(key) === value) return

      values.set(key, value)
      notify(key, value)
    },

    removeItem(key) {
      const existed = values.delete(key)
      if (existed) notify(key, null)
    },

    subscribe(
      key,
      listener,
      onError: StorageListenerErrorHandler
    ): Unsubscribe {
      const subscription = { listener, onError } satisfies StorageSubscription
      const current = listeners.get(key) ?? new Set<StorageSubscription>()
      current.add(subscription)
      listeners.set(key, current)

      let active = true

      return () => {
        if (!active) return
        active = false

        const registered = listeners.get(key)
        if (!registered) return
        registered.delete(subscription)
        if (registered.size === 0) listeners.delete(key)
      }
    },

    clear() {
      const keys = [...values.keys()]
      values.clear()
      keys.forEach((key) => notify(key, null))
    },

    entries() {
      return new Map(values)
    },
  }
}
