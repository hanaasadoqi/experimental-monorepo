import { PersistenceError } from "../errors/persistence-error.js"
import type {
  StorageListener,
  StorageListenerErrorHandler,
  StorageSubscription,
  SynchronousSubscribableStringStorage,
  Unsubscribe,
} from "./types.js"

export interface LocalStorageOptions {
  getWindow?: () => Window | undefined
}

const listenersByWindow = new WeakMap<
  Window,
  Map<string, Set<StorageSubscription>>
>()

function deliver(
  subscription: StorageSubscription,
  value: string | null
): void {
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
}

function defaultGetWindow(): Window | undefined {
  return typeof window === "undefined" ? undefined : window
}

export function createLocalStorage(
  options: LocalStorageOptions = {}
): SynchronousSubscribableStringStorage {
  const getWindow = options.getWindow ?? defaultGetWindow

  const getLocalStorage = (
    operation: "read" | "write" | "remove" | "subscribe"
  ) => {
    const currentWindow = getWindow()
    if (!currentWindow) {
      throw new PersistenceError(
        "localStorage is unavailable in this runtime",
        {
          code: "unavailable",
          operation,
        }
      )
    }

    try {
      return {
        currentWindow,
        storage: currentWindow.localStorage,
      }
    } catch (cause) {
      throw new PersistenceError("localStorage is unavailable", {
        code: "unavailable",
        operation,
        cause,
      })
    }
  }

  const getListeners = (
    currentWindow: Window
  ): Map<string, Set<StorageSubscription>> => {
    const existing = listenersByWindow.get(currentWindow)
    if (existing) return existing

    const listeners = new Map<string, Set<StorageSubscription>>()
    listenersByWindow.set(currentWindow, listeners)
    return listeners
  }

  const notifyLocal = (
    currentWindow: Window,
    key: string,
    value: string | null
  ): void => {
    getListeners(currentWindow)
      .get(key)
      ?.forEach((subscription) => deliver(subscription, value))
  }

  return {
    getItem(key) {
      const { storage } = getLocalStorage("read")
      try {
        return storage.getItem(key)
      } catch (cause) {
        throw new PersistenceError(`Failed to read persistence key "${key}"`, {
          code: "storage",
          operation: "read",
          key,
          cause,
        })
      }
    },

    setItem(key, value) {
      const { currentWindow, storage } = getLocalStorage("write")
      let previousValue: string | null

      try {
        previousValue = storage.getItem(key)
        storage.setItem(key, value)
      } catch (cause) {
        throw new PersistenceError(`Failed to write persistence key "${key}"`, {
          code: "storage",
          operation: "write",
          key,
          cause,
        })
      }

      if (previousValue !== value) {
        notifyLocal(currentWindow, key, value)
      }
    },

    removeItem(key) {
      const { currentWindow, storage } = getLocalStorage("remove")
      let existed: boolean

      try {
        existed = storage.getItem(key) !== null
        storage.removeItem(key)
      } catch (cause) {
        throw new PersistenceError(
          `Failed to remove persistence key "${key}"`,
          {
            code: "storage",
            operation: "remove",
            key,
            cause,
          }
        )
      }

      if (existed) {
        notifyLocal(currentWindow, key, null)
      }
    },

    subscribe(
      key,
      listener: StorageListener,
      onError: StorageListenerErrorHandler
    ): Unsubscribe {
      const { currentWindow, storage } = getLocalStorage("subscribe")
      const listeners = getListeners(currentWindow)
      const subscription = { listener, onError } satisfies StorageSubscription

      const onStorage = (event: StorageEvent): void => {
        if (event.storageArea !== storage) return
        if (event.key !== null && event.key !== key) return
        deliver(subscription, event.key === null ? null : event.newValue)
      }

      try {
        currentWindow.addEventListener("storage", onStorage)
      } catch (cause) {
        throw new PersistenceError(
          `Failed to subscribe to persistence key "${key}"`,
          {
            code: "storage",
            operation: "subscribe",
            key,
            cause,
          }
        )
      }

      const current = listeners.get(key) ?? new Set<StorageSubscription>()
      current.add(subscription)
      listeners.set(key, current)

      let active = true

      return () => {
        if (!active) return
        active = false

        try {
          currentWindow.removeEventListener("storage", onStorage)
        } catch (cause) {
          throw new PersistenceError(
            `Failed to unsubscribe from persistence key "${key}"`,
            {
              code: "storage",
              operation: "subscribe",
              key,
              cause,
            }
          )
        } finally {
          const registered = listeners.get(key)
          if (registered) {
            registered.delete(subscription)
            if (registered.size === 0) listeners.delete(key)
          }
        }
      }
    },
  }
}
