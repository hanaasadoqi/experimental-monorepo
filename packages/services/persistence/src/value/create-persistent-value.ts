import {
  PersistenceError,
  toPersistenceError,
} from "../errors/persistence-error.js"
import type { Serializer } from "../serialization/types.js"
import type {
  StringStorage,
  SubscribableStringStorage,
} from "../storage/types.js"
import type { PersistentValue, SubscribablePersistentValue } from "./types.js"

export interface PersistentValueOptions<T> {
  key: string
  storage: StringStorage
  serializer: Serializer<T>
}

export interface SubscribablePersistentValueOptions<T> extends Omit<
  PersistentValueOptions<T>,
  "storage"
> {
  storage: SubscribableStringStorage
}

function createBasePersistentValue<T>(
  options: PersistentValueOptions<T>
): PersistentValue<T> {
  return {
    key: options.key,

    async read() {
      let serialized: string | null
      try {
        serialized = await options.storage.getItem(options.key)
      } catch (error) {
        throw toPersistenceError(
          error,
          { code: "storage", operation: "read", key: options.key },
          `Failed to read persistence key "${options.key}"`
        )
      }

      if (serialized === null) return null

      try {
        return options.serializer.deserialize(serialized)
      } catch (error) {
        throw toPersistenceError(
          error,
          { code: "validation", operation: "deserialize", key: options.key },
          `Failed to deserialize persistence key "${options.key}"`
        )
      }
    },

    async write(value) {
      let serialized: string
      try {
        serialized = options.serializer.serialize(value)
      } catch (error) {
        throw toPersistenceError(
          error,
          { code: "serialization", operation: "serialize", key: options.key },
          `Failed to serialize persistence key "${options.key}"`
        )
      }

      try {
        await options.storage.setItem(options.key, serialized)
      } catch (error) {
        throw toPersistenceError(
          error,
          { code: "storage", operation: "write", key: options.key },
          `Failed to write persistence key "${options.key}"`
        )
      }
    },

    async remove() {
      try {
        await options.storage.removeItem(options.key)
      } catch (error) {
        throw toPersistenceError(
          error,
          { code: "storage", operation: "remove", key: options.key },
          `Failed to remove persistence key "${options.key}"`
        )
      }
    },
  }
}

export function createPersistentValue<T>(
  options: PersistentValueOptions<T>
): PersistentValue<T> {
  return createBasePersistentValue(options)
}

export function createSubscribablePersistentValue<T>(
  options: SubscribablePersistentValueOptions<T>
): SubscribablePersistentValue<T> {
  const base = createBasePersistentValue(options)

  return {
    ...base,

    subscribe(listener, onError) {
      try {
        return options.storage.subscribe(
          options.key,
          (serialized) => {
            if (serialized === null) {
              listener(null)
              return
            }

            let value: T
            try {
              value = options.serializer.deserialize(serialized)
            } catch (error) {
              throw toPersistenceError(
                error,
                {
                  code: "validation",
                  operation: "deserialize",
                  key: options.key,
                },
                `Failed to deserialize persistence key "${options.key}"`
              )
            }

            listener(value)
          },
          (error) => {
            const normalized =
              error instanceof PersistenceError
                ? error
                : new PersistenceError(
                    `Persistence subscriber failed for key "${options.key}"`,
                    {
                      code: "observer",
                      operation: "subscribe",
                      key: options.key,
                      cause: error,
                    }
                  )

            onError(normalized)
          }
        )
      } catch (error) {
        throw toPersistenceError(
          error,
          {
            code: "storage",
            operation: "subscribe",
            key: options.key,
          },
          `Failed to subscribe to persistence key "${options.key}"`
        )
      }
    },
  }
}
