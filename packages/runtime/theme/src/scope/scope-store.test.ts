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

describe("createScopeStore", () => {
  it("defaults isDarkMode to false when an enabled theme has no supplied mode", () => {
    const store = createScopeStore({
      scopeId: "preview",
      initialEnableDarkMode: true,
    })

    expect(store.getState()).toMatchObject({
      scopeId: "preview",
      enableDarkMode: true,
      isDarkMode: false,
    })
  })

  it("honors the supplied initial dark mode", () => {
    const store = createScopeStore({
      scopeId: "preview",
      initialEnableDarkMode: true,
      initialIsDarkMode: true,
    })

    expect(store.getState().isDarkMode).toBe(true)
  })

  it("does not retain a dark mode value when dark mode is disabled", () => {
    const store = createScopeStore({
      scopeId: "preview",
      initialEnableDarkMode: false,
      initialIsDarkMode: true,
    })

    expect(store.getState().isDarkMode).toBeUndefined()
  })

  it("merges overrides and supports primary color updates", () => {
    const store = createScopeStore({
      scopeId: "preview",
      initialEnableDarkMode: true,
      initialOverrides: { primary: "oklch(50% 0.1 200)" },
    })

    store.getState().setOverrides({ accent: "oklch(60% 0.1 210)" })
    store.getState().setPrimaryColor("oklch(70% 0.1 220)")

    expect(store.getState().overrides).toEqual({
      primary: "oklch(70% 0.1 220)",
      accent: "oklch(60% 0.1 210)",
    })
  })

  it("only changes the active mode while dark mode is enabled", () => {
    const store = createScopeStore({
      scopeId: "preview",
      initialEnableDarkMode: false,
    })

    store.getState().setDarkMode(true)
    expect(store.getState().isDarkMode).toBeUndefined()

    store.getState().setEnableDarkMode(true, true)
    expect(store.getState()).toMatchObject({
      enableDarkMode: true,
      isDarkMode: true,
    })

    store.getState().toggleDarkMode()
    expect(store.getState().isDarkMode).toBe(false)

    store.getState().toggleEnableDarkMode()
    expect(store.getState()).toMatchObject({ enableDarkMode: false })
    expect(store.getState().isDarkMode).toBeUndefined()
  })
})

describe("scope persistence", () => {
  it("builds a scope-specific storage key", () => {
    expect(getScopeStorageKey("preview")).toBe("synapcity:themes:preview")
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
    expect(store.getState().isDarkMode).toBe(false)
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

  it("lets a persisted disabled setting clear the active dark mode", async () => {
    const persisted = JSON.stringify({
      state: { overrides: {}, enableDarkMode: false, isDarkMode: true },
      version: 1,
    })
    const { storage } = createMemoryStorage({
      [getScopeStorageKey("preview")]: persisted,
    })
    const store = createScopeStore({
      scopeId: "preview",
      initialEnableDarkMode: true,
      initialIsDarkMode: true,
      storage,
    })

    await store.persist.rehydrate()

    expect(store.getState().enableDarkMode).toBe(false)
    expect(store.getState().isDarkMode).toBeUndefined()
  })

  it("persists state fields without persisting runtime scope metadata", () => {
    const { storage, values } = createMemoryStorage()
    const store = createScopeStore({
      scopeId: "preview",
      sourceId: "base-theme",
      initialEnableDarkMode: true,
      storage,
    })

    store.getState().setPrimaryColor("oklch(70% 0.1 220)")

    const serialized = values.get(getScopeStorageKey("preview"))
    expect(serialized).toBeDefined()

    const persisted = JSON.parse(serialized ?? "") as {
      state: Record<string, unknown>
      version: number
    }

    expect(persisted.version).toBe(1)
    expect(persisted.state).toMatchObject({
      id: store.getState().id,
      overrides: { primary: "oklch(70% 0.1 220)" },
      enableDarkMode: true,
      isDarkMode: false,
    })
    expect(persisted.state).not.toHaveProperty("scopeId")
    expect(persisted.state).not.toHaveProperty("sourceId")
  })
})
