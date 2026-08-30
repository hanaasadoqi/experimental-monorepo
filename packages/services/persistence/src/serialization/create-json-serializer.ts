import { PersistenceError } from "../errors/persistence-error.js"
import type { Serializer, UnknownParser } from "./types.js"

export interface JsonSerializerOptions<T> {
  parse: UnknownParser<T>
  replacer?: Parameters<typeof JSON.stringify>[1]
}

export function createJsonSerializer<T>(
  options: JsonSerializerOptions<T>
): Serializer<T> {
  return {
    serialize(value) {
      try {
        const serialized = JSON.stringify(value, options.replacer)
        if (serialized === undefined) {
          throw new TypeError("JSON.stringify returned undefined")
        }
        return serialized
      } catch (cause) {
        throw new PersistenceError("Failed to serialize persisted value", {
          code: "serialization",
          operation: "serialize",
          cause,
        })
      }
    },

    deserialize(serialized) {
      let parsed: unknown
      try {
        parsed = JSON.parse(serialized)
      } catch (cause) {
        throw new PersistenceError("Persisted value is not valid JSON", {
          code: "serialization",
          operation: "deserialize",
          cause,
        })
      }

      try {
        return options.parse(parsed)
      } catch (cause) {
        throw new PersistenceError(
          "Persisted value failed runtime validation",
          {
            code: "validation",
            operation: "deserialize",
            cause,
          }
        )
      }
    },
  }
}
