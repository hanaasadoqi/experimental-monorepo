import type { PersistenceError } from "../errors/persistence-error.js"
import type { Unsubscribe } from "../storage/types.js"

export interface PersistentValue<T> {
  readonly key: string
  read(): Promise<T | null>
  write(value: T): Promise<void>
  remove(): Promise<void>
}

export interface SubscribablePersistentValue<T> extends PersistentValue<T> {
  subscribe(
    listener: (value: T | null) => void,
    onError: (error: PersistenceError) => void
  ): Unsubscribe
}
