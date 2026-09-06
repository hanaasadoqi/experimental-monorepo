import { describe, expect, it } from "vitest"
import type { StateStorage } from "zustand/middleware"

import { createScopeStore, getScopeStorageKey } from "./scope-store"

function createMemoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  const storage: StateStorage = {
    getItem: (name) => values.get(name) ?? null,
    setItem: (name, value) => {
      values.set(name, value)
    },
    removeItem: (name) => {
      values.delete(name)
    },
  }
  return { storage, values }
}

describe("scope storage migration", () => {
  it("defaults isDarkMode to false when an enabled theme has no supplied mode", () => {
    const store = createScopeStore({
      scopeId: "preview",
      initialEnableDarkMode: true,
    })

    expect(store.getState()).toMatchObject({
      enableDarkMode: true,
      isDarkMode: false,
    })
  })

  it("rehydrates a legacy key and copies it to the current key", async () => {
    const persisted = JSON.stringify({
      state: { overrides: { primary: "oklch(50% 0.1 200)" } },
      version: 1,
    })
    const { storage, values } = createMemoryStorage({
      "synapcity:scope:preview": persisted,
    })
    const store = createScopeStore({
      scopeId: "preview",
      initialEnableDarkMode: true,
      storage,
    })

    await store.persist.rehydrate()

    expect(store.getState().overrides.primary).toBe("oklch(50% 0.1 200)")
    expect(values.get(getScopeStorageKey("preview"))).toBe(persisted)
    expect(values.get("synapcity:scope:preview")).toBe(persisted)
  })

  it("prefers current persisted state when both keys exist", async () => {
    const current = JSON.stringify({ state: { overrides: {} }, version: 1 })
    const legacy = JSON.stringify({
      state: { overrides: { primary: "legacy" } },
      version: 1,
    })
    const { storage } = createMemoryStorage({
      [getScopeStorageKey("preview")]: current,
      "synapcity:scope:preview": legacy,
    })
    const store = createScopeStore({
      scopeId: "preview",
      initialEnableDarkMode: true,
      storage,
    })

    await store.persist.rehydrate()

    expect(store.getState().overrides).toEqual({})
  })

  it("reads the legacy dark-mode field into rendered state", async () => {
    const persisted = JSON.stringify({
      state: { overrides: {}, isDarkModeEnabled: true },
      version: 1,
    })
    const { storage } = createMemoryStorage({
      [getScopeStorageKey("preview")]: persisted,
    })
    const store = createScopeStore({
      scopeId: "preview",
      initialEnableDarkMode: true,
      storage,
    })

    await store.persist.rehydrate()

    expect(store.getState().isDarkMode).toBe(true)
  })
})
