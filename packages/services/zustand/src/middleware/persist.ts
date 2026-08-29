import type { StateCreator, StoreApi } from "zustand"
import type { PersistenceAdapter } from "../types/index.ts"
import type { Middleware } from "./types.ts"

export interface PersistMiddlewareOptions<T> {
  /**
   * The key used to identify this store in persistence.
   * Required unless using a custom adapter that doesn't need one.
   */
  key?: string

  /**
   * Adapter for persisting state. Required.
   */
  adapter: PersistenceAdapter<T>

  /**
   * Versions config for migrations.
   * Allows you to version your store schema and migrate between versions.
   */
  version?: number

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
    _key,
    adapter,
    _version,
    merge,
    onRehydrate,
    onError,
    syncExternal = true,
  } = options as PersistMiddlewareOptions<T> & {
    _key?: string
    _version?: number
  }

  return (next: StateCreator<T, []>) => {
    return (set, get, api: StoreApi<T>) => {
      const store = next(
        (update: Partial<T> | ((state: T) => Partial<T>)) => {
          // Persist state on every update
          const nextState =
            typeof update === "function" ? update(get()) : update
          const merged = { ...get(), ...nextState }

          try {
            adapter.write(merged)
          } catch (error: unknown) {
            if (onError) {
              onError(error instanceof Error ? error : new Error(String(error)))
            }
          }

          set(update)
        },
        get,
        api
      )

      // Rehydrate on initialization
      try {
        const persisted = adapter.read()
        if (persisted) {
          // Merge persisted state into the store object
          const initial = store as Record<string, unknown>
          const merged = merge
            ? merge(persisted, store)
            : { ...store, ...persisted }

          // Update the store object in place with merged values
          for (const key in merged) {
            if (typeof merged[key as keyof T] !== "function") {
              initial[key] = merged[key as keyof T]
            }
          }

          if (onRehydrate) {
            onRehydrate(merged as T)
          }
        }
      } catch (error: unknown) {
        if (onError) {
          onError(error instanceof Error ? error : new Error(String(error)))
        }
      }

      // Subscribe to external storage changes if enabled
      if (syncExternal) {
        const unsubscribe = adapter.subscribe(() => {
          try {
            const persisted = adapter.read()
            if (persisted) {
              const initial = get()
              const merged = merge
                ? merge(persisted, initial)
                : { ...initial, ...persisted }

              // Extract only the persisted values (exclude methods)
              const persistedDelta: Partial<T> = {}
              for (const key in persisted) {
                if (typeof persisted[key as keyof T] !== "function") {
                  persistedDelta[key as keyof T] = persisted[key as keyof T]
                }
              }

              set(persistedDelta as Partial<T>)
              if (onRehydrate) {
                onRehydrate(merged as T)
              }
            }
          } catch (error: unknown) {
            if (onError) {
              onError(error instanceof Error ? error : new Error(String(error)))
            }
          }
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
  "adapter"
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
