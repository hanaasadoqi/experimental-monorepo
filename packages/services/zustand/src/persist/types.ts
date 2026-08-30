export type MaybePromise<T> = T | Promise<T>

export type StoreMigration<TState> = (state: unknown) => MaybePromise<TState>
export type StoreMigrations<TState> = Readonly<Record<number, StoreMigration<TState>>>

export interface PersistLifecycle {
  rehydrate(): Promise<void>
  hasHydrated(): boolean
  onHydrate(listener: () => void): () => void
  onFinishHydration(listener: () => void): () => void
}

export interface PersistOptionsLike {
  name: string
}

export interface PersistStorageLifecycle extends PersistLifecycle {
  getOptions(): PersistOptionsLike
  clearStorage?(): void | Promise<void>
}

export interface PersistedStoreLike {
  persist: PersistLifecycle
}

export interface StoragePersistedStoreLike {
  persist: PersistStorageLifecycle
}

export interface StorageEventLike {
  key: string | null
  newValue: string | null
}

export interface StorageEventTargetLike {
  addEventListener(type: "storage", listener: (event: StorageEventLike) => void): void
  removeEventListener(type: "storage", listener: (event: StorageEventLike) => void): void
}
