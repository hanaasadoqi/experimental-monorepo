import { describe, expect, it } from "vitest"

import { MemoryStorage } from "./storage.js"

describe("MemoryStorage", () => {
  it("stores string values and removes them deterministically", () => {
    const storage = new MemoryStorage()

    storage.setItem("count", "1")
    expect(storage.getItem("count")).toBe("1")
    expect(storage.length).toBe(1)

    storage.removeItem("count")
    expect(storage.getItem("count")).toBeNull()
    expect(storage.length).toBe(0)
  })

  it("returns null for a key that was never set", () => {
    const storage = new MemoryStorage()

    expect(storage.getItem("missing")).toBeNull()
  })

  it("coerces non-string keys and values to strings", () => {
    const storage = new MemoryStorage()

    // @ts-expect-error -- exercising runtime coercion with non-string inputs
    storage.setItem(42, 7)

    expect(storage.getItem("42")).toBe("7")
  })

  it("clears all stored entries and resets the length", () => {
    const storage = new MemoryStorage()

    storage.setItem("a", "1")
    storage.setItem("b", "2")
    expect(storage.length).toBe(2)

    storage.clear()

    expect(storage.length).toBe(0)
    expect(storage.getItem("a")).toBeNull()
    expect(storage.getItem("b")).toBeNull()
  })

  it("returns the key at a given insertion-order index", () => {
    const storage = new MemoryStorage()

    storage.setItem("first", "1")
    storage.setItem("second", "2")

    expect(storage.key(0)).toBe("first")
    expect(storage.key(1)).toBe("second")
  })

  it("returns null when the index is out of range", () => {
    const storage = new MemoryStorage()

    storage.setItem("only", "1")

    expect(storage.key(1)).toBeNull()
    expect(storage.key(-1)).toBeNull()
  })

  it("reflects removals in subsequent key() lookups", () => {
    const storage = new MemoryStorage()

    storage.setItem("first", "1")
    storage.setItem("second", "2")
    storage.removeItem("first")

    expect(storage.key(0)).toBe("second")
  })
})
