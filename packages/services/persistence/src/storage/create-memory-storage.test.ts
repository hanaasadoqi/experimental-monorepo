import { describe, expect, it, vi } from "vitest"

import { createMemoryStorage } from "./create-memory-storage.js"

describe("createMemoryStorage", () => {
  it("round-trips values", () => {
    const storage = createMemoryStorage()
    storage.setItem("key", "value")
    expect(storage.getItem("key")).toBe("value")
  })

  it("notifies subscribers for writes and removals", () => {
    const storage = createMemoryStorage()
    const listener = vi.fn()
    const unsubscribe = storage.subscribe("key", listener, vi.fn())

    storage.setItem("key", "one")
    storage.removeItem("key")
    unsubscribe()
    storage.setItem("key", "two")

    expect(listener).toHaveBeenNthCalledWith(1, "one")
    expect(listener).toHaveBeenNthCalledWith(2, null)
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it("does not notify when a write does not change storage", () => {
    const storage = createMemoryStorage()
    const listener = vi.fn()
    const unsubscribe = storage.subscribe("key", listener, vi.fn())

    storage.setItem("key", "value")
    storage.setItem("key", "value")
    storage.removeItem("key")
    storage.removeItem("key")
    unsubscribe()

    expect(listener).toHaveBeenCalledTimes(2)
  })

  it("keeps duplicate subscriptions independent", () => {
    const storage = createMemoryStorage()
    const listener = vi.fn()
    const unsubscribeFirst = storage.subscribe("key", listener, vi.fn())
    const unsubscribeSecond = storage.subscribe("key", listener, vi.fn())

    unsubscribeFirst()
    storage.setItem("key", "value")
    unsubscribeSecond()

    expect(listener).toHaveBeenCalledOnce()
  })

  it("isolates a failed listener and continues notifying subscribers", () => {
    const storage = createMemoryStorage()
    const listenerError = new Error("listener failed")
    const onError = vi.fn()
    const nextListener = vi.fn()

    storage.subscribe(
      "key",
      () => {
        throw listenerError
      },
      onError
    )
    storage.subscribe("key", nextListener, vi.fn())

    expect(() => storage.setItem("key", "value")).not.toThrow()
    expect(onError).toHaveBeenCalledWith(listenerError)
    expect(nextListener).toHaveBeenCalledWith("value")
  })
})
