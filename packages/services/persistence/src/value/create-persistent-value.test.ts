import { describe, expect, it, vi } from "vitest"

import { createJsonSerializer } from "../serialization/create-json-serializer.js"
import { createMemoryStorage } from "../storage/create-memory-storage.js"
import {
  createPersistentValue,
  createSubscribablePersistentValue,
} from "./create-persistent-value.js"

interface Value {
  count: number
}

const serializer = createJsonSerializer<Value>({
  parse(value) {
    if (
      typeof value !== "object" ||
      value === null ||
      !("count" in value) ||
      typeof value.count !== "number"
    ) {
      throw new TypeError("Invalid value")
    }

    return { count: value.count }
  },
})

describe("persistent values", () => {
  it("binds a key to storage and serialization", async () => {
    const storage = createMemoryStorage()
    const value = createPersistentValue({
      key: "counter",
      storage,
      serializer,
    })

    await expect(value.read()).resolves.toBeNull()
    await value.write({ count: 2 })
    await expect(value.read()).resolves.toEqual({ count: 2 })
    await value.remove()
    await expect(value.read()).resolves.toBeNull()
  })

  it("validates subscription values", async () => {
    const storage = createMemoryStorage()
    const value = createSubscribablePersistentValue({
      key: "counter",
      storage,
      serializer,
    })
    const listener = vi.fn()
    const onError = vi.fn()
    const unsubscribe = value.subscribe(listener, onError)

    await value.write({ count: 3 })
    storage.setItem("counter", '{"count":"bad"}')
    unsubscribe()

    expect(listener).toHaveBeenCalledWith({ count: 3 })
    expect(onError).toHaveBeenCalledOnce()
  })

  it("reports invalid subscription data without failing the completed storage write", () => {
    const storage = createMemoryStorage()
    const value = createSubscribablePersistentValue({
      key: "counter",
      storage,
      serializer,
    })
    const onError = vi.fn()
    const unsubscribe = value.subscribe(vi.fn(), onError)

    expect(() => storage.setItem("counter", '{"count":"bad"}')).not.toThrow()
    expect(onError).toHaveBeenCalledOnce()
    unsubscribe()
  })

  it("adds the bound key without losing serializer error classification", async () => {
    const storage = createMemoryStorage({
      initialValues: { counter: "not-json" },
    })
    const value = createPersistentValue({
      key: "counter",
      storage,
      serializer,
    })

    await expect(value.read()).rejects.toMatchObject({
      name: "PersistenceError",
      code: "serialization",
      operation: "deserialize",
      key: "counter",
    })

    await expect(value.read()).rejects.toThrow('persistence key "counter"')
  })

  it("reports consumer listener failures without failing a completed write", async () => {
    const storage = createMemoryStorage()
    const value = createSubscribablePersistentValue({
      key: "counter",
      storage,
      serializer,
    })
    const listenerError = new Error("consumer failed")
    const onError = vi.fn()

    value.subscribe(() => {
      throw listenerError
    }, onError)

    await expect(value.write({ count: 1 })).resolves.toBeUndefined()
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "PersistenceError",
        code: "observer",
        operation: "subscribe",
        key: "counter",
        cause: listenerError,
      })
    )
  })

  it("adds the bound key to subscription setup failures", () => {
    const storage = {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
      subscribe: () => {
        throw new Error("subscription unavailable")
      },
    }
    const value = createSubscribablePersistentValue({
      key: "counter",
      storage,
      serializer,
    })

    expect(() => value.subscribe(vi.fn(), vi.fn())).toThrowError(
      expect.objectContaining({
        name: "PersistenceError",
        operation: "subscribe",
        key: "counter",
      })
    )
  })

  it("isolates a failing subscription error reporter", async () => {
    const storage = createMemoryStorage()
    const value = createSubscribablePersistentValue({
      key: "counter",
      storage,
      serializer,
    })
    const onError = vi.fn(() => {
      throw new Error("reporter failed")
    })

    value.subscribe(vi.fn(), onError)

    await expect(value.write({ count: Number.NaN })).resolves.toBeUndefined()
    expect(onError).toHaveBeenCalledOnce()
  })

  it("normalizes asynchronous storage without changing the value API", async () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: async (key: string) => values.get(key) ?? null,
      setItem: async (key: string, storedValue: string) => {
        values.set(key, storedValue)
      },
      removeItem: async (key: string) => {
        values.delete(key)
      },
    }
    const value = createPersistentValue({
      key: "counter",
      storage,
      serializer,
    })

    await value.write({ count: 4 })
    await expect(value.read()).resolves.toEqual({ count: 4 })
    await value.remove()
    await expect(value.read()).resolves.toBeNull()
  })

  it("normalizes asynchronous storage failures with operation context", async () => {
    const storage = {
      getItem: async () => null,
      setItem: async () => {
        throw new Error("quota exceeded")
      },
      removeItem: async () => undefined,
    }
    const value = createPersistentValue({
      key: "counter",
      storage,
      serializer,
    })

    await expect(value.write({ count: 1 })).rejects.toMatchObject({
      name: "PersistenceError",
      code: "storage",
      operation: "write",
      key: "counter",
    })
  })
})
