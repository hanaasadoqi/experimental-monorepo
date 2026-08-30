import { beforeEach, describe, expect, it, vi } from "vitest"

import type { PersistenceAdapter } from "../types/index.js"
import { createMemoryAdapter } from "./memory-adapter.js"

interface TestState {
  count: number
}

describe("Memory persistence adapter", () => {
  const defaultKey = "memory-primary"
  let adapter: PersistenceAdapter<TestState>

  beforeEach(() => {
    adapter = createMemoryAdapter<TestState>(defaultKey)
  })

  it("returns null when a key is absent", async () => {
    await expect(adapter.read?.(defaultKey)).resolves.toBeNull()
  })

  it("round-trips values", async () => {
    await adapter.write?.(defaultKey, { count: 42 })

    await expect(adapter.read?.(defaultKey)).resolves.toEqual({ count: 42 })
  })

  it("overwrites a value at the same key", async () => {
    await adapter.write?.(defaultKey, { count: 1 })
    await adapter.write?.(defaultKey, { count: 2 })

    await expect(adapter.read?.(defaultKey)).resolves.toEqual({ count: 2 })
  })

  it("keeps values isolated by key", async () => {
    await adapter.write?.("first", { count: 1 })
    await adapter.write?.("second", { count: 2 })

    await expect(adapter.read?.("first")).resolves.toEqual({ count: 1 })
    await expect(adapter.read?.("second")).resolves.toEqual({ count: 2 })
  })

  it("deletes one value", async () => {
    await adapter.write?.("first", { count: 1 })
    await adapter.write?.("second", { count: 2 })

    await adapter.delete?.("first")

    await expect(adapter.read?.("first")).resolves.toBeNull()
    await expect(adapter.read?.("second")).resolves.toEqual({ count: 2 })
  })

  it("clears all in-memory values", async () => {
    await adapter.write?.("first", { count: 1 })
    await adapter.write?.("second", { count: 2 })

    await adapter.clear?.()

    await expect(adapter.read?.("first")).resolves.toBeNull()
    await expect(adapter.read?.("second")).resolves.toBeNull()
  })

  it("provides a safe no-op subscription", async () => {
    const listener = vi.fn()
    const unsubscribe = adapter.subscribe?.(defaultKey, listener)

    await adapter.write?.(defaultKey, { count: 1 })

    expect(listener).not.toHaveBeenCalled()
    expect(() => unsubscribe?.()).not.toThrow()
  })
})
