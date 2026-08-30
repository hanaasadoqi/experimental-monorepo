import type { StateCreator, StoreApi } from "zustand"
import type { PersistenceAdapter } from "../types/index.ts"
import type { Middleware } from "./types.ts"

export interface PersistMiddlewareOptions<T> {
  /**
   * The key used to identify this store in persistence.
   */
  key: string

  /**
   * Adapter for persisting state. Required.
   */
  adapter: PersistenceAdapter<T>

  /**
   * Merge strategy for rehydrating state.
   * Defaults to shallow merge of persisted state over initial state.
   */
  merge?: (persisted: Partial<T>, initial: T) => T

  /**
   * Hook called after successful rehydration.
   */
  onRehydrate?: (state: T) => void

  /**
   * Hook called on rehydration error.
   */
  onError?: (error: Error) => void

  /**
   * Whether to immediately sync external storage changes.
   * If true, external changes trigger a re-read.
   */
  syncExternal?: boolean
}

/**
 * Persistence middleware for Zustand.
 * Automatically persists state changes and rehydrates on initialization.
 *
 * @example
 * ```typescript
 * interface State {
 *   count: number
 *   increment: () => void
 * }
 *
 * const useStore = create<State>(
 *   persistMiddleware({
 *     key: "app-state",
 *     adapter: createLocalStorageAdapter("app-state"),
 *   })(
 *     (set) => ({
 *       count: 0,
 *       increment: () => set((state) => ({ count: state.count + 1 })),
 *     })
 *   )
 * )
 * ```
 */
export const persistMiddleware = <T>(
  options: PersistMiddlewareOptions<T>
): Middleware<T> => {
  const {
    key,
    adapter,
    merge,
    onRehydrate,
    onError,
    syncExternal = true,
  } = options

  if (key.trim().length === 0) {
    throw new TypeError("Persistence key must not be empty")
  }

  const reportError = (error: unknown): void => {
    onError?.(error instanceof Error ? error : new Error(String(error)))
  }

  const withoutFunctions = (state: Partial<T>): Partial<T> => {
    const result: Partial<T> = {}
    for (const property in state) {
      if (typeof state[property] !== "function") {
        result[property] = state[property]
      }
    }
    return result
  }

  return (next: StateCreator<T, []>) => {
    return (set, get, api: StoreApi<T>) => {
      const store = next(
        (update: Partial<T> | ((state: T) => Partial<T>)) => {
          set(update)

          if (adapter.write) {
            void adapter.write(key, get()).catch(reportError)
          }
        },
        get,
        api
      )

      const applyPersistedState = (persisted: Partial<T>): void => {
        const current = get()
        const nextState = merge
          ? merge(persisted, current)
          : { ...current, ...withoutFunctions(persisted) }

        set(nextState)
        onRehydrate?.(get())
      }

      const rehydrate = async (externalValue?: T | null): Promise<void> => {
        try {
          const persisted =
            externalValue === undefined
              ? adapter.read
                ? await adapter.read(key)
                : null
              : externalValue

          if (persisted !== null) applyPersistedState(persisted)
        } catch (error: unknown) {
          reportError(error)
        }
      }

      void rehydrate()

      // Subscribe to external storage changes if enabled
      if (syncExternal && adapter.subscribe) {
        const unsubscribe = adapter.subscribe(key, (value) => {
          void rehydrate(value)
        })

        // Attach cleanup to store API
        ;(api as unknown as Record<string, unknown>).__persistCleanup =
          unsubscribe
      }

      return store
    }
  }
}

/**
 * Async version of persistMiddleware that supports async adapters.
 * Useful for adapters that need async I/O (e.g., IndexedDB).
 */
export interface AsyncPersistMiddlewareOptions<T> extends Omit<
  PersistMiddlewareOptions<T>,
  "adapter" | "key"
> {
  adapter: {
    read(): Promise<T | undefined>
    write(state: T): Promise<void>
    subscribe(listener: () => void): () => void
  }
}

export const asyncPersistMiddleware = <T>(
  options: AsyncPersistMiddlewareOptions<T>
): Middleware<T> => {
  const { adapter, merge, onRehydrate, onError, syncExternal = true } = options

  return (next: StateCreator<T, []>) => {
    return (set, get, api: StoreApi<T>) => {
      const store = next(
        (update: Partial<T> | ((state: T) => Partial<T>)) => {
          const nextState =
            typeof update === "function" ? update(get()) : update
          const merged = { ...get(), ...nextState }

          adapter.write(merged).catch((error) => {
            if (onError) {
              onError(error instanceof Error ? error : new Error(String(error)))
            }
          })

          set(update)
        },
        get,
        api
      )

      // Async rehydration on initialization
      ;(async () => {
        try {
          const persisted = await adapter.read()
          if (persisted) {
            const initial = store
            const merged = merge
              ? merge(persisted, initial)
              : { ...initial, ...persisted }

            set(merged)
            if (onRehydrate) {
              onRehydrate(merged)
            }
          }
        } catch (error: unknown) {
          if (onError) {
            onError(error instanceof Error ? error : new Error(String(error)))
          }
        }
      })()

      // Subscribe to external storage changes
      if (syncExternal) {
        const unsubscribe = adapter.subscribe(async () => {
          try {
            const persisted = await adapter.read()
            if (persisted) {
              const initial = store
              const merged = merge
                ? merge(persisted, initial)
                : { ...initial, ...persisted }

              set(merged)
            }
          } catch (error) {
            if (onError) {
              onError(error instanceof Error ? error : new Error(String(error)))
            }
          }
        })

        ;(api as unknown as Record<string, unknown>).__persistCleanup =
          unsubscribe
      }

      return store
    }
  }
}
