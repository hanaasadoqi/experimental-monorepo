export type MaybePromise<T> = T | Promise<T>
export type Unsubscribe = () => void

export interface StringStorage {
  getItem(key: string): MaybePromise<string | null>
  setItem(key: string, value: string): MaybePromise<void>
  removeItem(key: string): MaybePromise<void>
}

export interface SynchronousStringStorage extends StringStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export type StorageListener = (value: string | null) => void
export type StorageListenerErrorHandler = (error: unknown) => void

export interface StorageSubscription {
  readonly listener: StorageListener
  readonly onError: StorageListenerErrorHandler
}

export interface SubscribableStringStorage extends StringStorage {
  subscribe(
    key: string,
    listener: StorageListener,
    onError: StorageListenerErrorHandler
  ): Unsubscribe
}

export interface SynchronousSubscribableStringStorage extends SynchronousStringStorage {
  subscribe(
    key: string,
    listener: StorageListener,
    onError: StorageListenerErrorHandler
  ): Unsubscribe
}

export function isSubscribableStringStorage(
  storage: StringStorage
): storage is SubscribableStringStorage {
  return "subscribe" in storage && typeof storage.subscribe === "function"
}
