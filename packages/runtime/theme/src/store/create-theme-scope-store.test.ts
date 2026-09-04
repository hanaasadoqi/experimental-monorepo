import { MemoryStorage } from "@repo/foundation-test-mocks/storage"
import { describe, expect, it } from "vitest"

import {
  createThemeScopeStore,
  getThemeScopeStorageKey,
} from "./create-theme-scope-store"

describe("createThemeScopeStore", () => {
  it("keeps separate store instances isolated", () => {
    const first = createThemeScopeStore({ scopeId: "first" })
    const second = createThemeScopeStore({ scopeId: "second" })

    first.getState().setPrimaryColor("#112233")

    expect(first.getState().overrides.primaryColor).toBe("#112233")
    expect(second.getState().overrides.primaryColor).toBeUndefined()
  })

  it("persists only durable overrides under the scope-specific key", () => {
    const storage = new MemoryStorage()
    const store = createThemeScopeStore({ scopeId: "preview", storage })

    store.getState().setPrimaryColor("#445566")

    expect(
      JSON.parse(storage.getItem(getThemeScopeStorageKey("preview"))!)
    ).toEqual({
      state: { overrides: { primaryColor: "#445566" } },
      version: 2,
    })
  })

  it("restores persisted overrides after explicit rehydration", async () => {
    const storage = new MemoryStorage()
    const first = createThemeScopeStore({ scopeId: "preview", storage })
    first.getState().setPrimaryColor("#778899")

    const restored = createThemeScopeStore({ scopeId: "preview", storage })
    await restored.persist.rehydrate()

    expect(restored.getState().overrides).toEqual({
      primaryColor: "#778899",
    })
  })

  it("fails safely when persisted overrides have an invalid shape", async () => {
    const storage = new MemoryStorage()
    storage.setItem(
      getThemeScopeStorageKey("preview"),
      JSON.stringify({
        state: { overrides: { primaryColor: 42 }, resolvedAppearance: "dark" },
        version: 1,
      })
    )
    const store = createThemeScopeStore({
      scopeId: "preview",
      initialOverrides: { primaryColor: "#abcdef" },
      storage,
    })

    await store.persist.rehydrate()

    expect(store.getState().overrides).toEqual({ primaryColor: "#abcdef" })
    expect(store.getState()).not.toHaveProperty("resolvedAppearance")
  })

  it("supports scoped dark mode overrides", () => {
    const store = createThemeScopeStore({ scopeId: "dark-override" })

    expect(store.getState().isDarkModeEnabled).toBeUndefined()

    store.getState().setDarkMode(true)
    expect(store.getState().isDarkModeEnabled).toBe(true)

    store.getState().setDarkMode(false)
    expect(store.getState().isDarkModeEnabled).toBe(false)

    store.getState().setDarkMode(undefined)
    expect(store.getState().isDarkModeEnabled).toBeUndefined()
  })

  it("persists dark mode state separately from overrides", async () => {
    const storage = new MemoryStorage()
    const store = createThemeScopeStore({
      scopeId: "dark-override",
      storage,
    })

    store.getState().setPrimaryColor("#112233")
    store.getState().setDarkMode(true)

    expect(
      JSON.parse(storage.getItem(getThemeScopeStorageKey("dark-override"))!)
    ).toEqual({
      state: { overrides: { primaryColor: "#112233" }, isDarkModeEnabled: true },
      version: 2,
    })
  })

  it("restores both overrides and dark mode after rehydration", async () => {
    const storage = new MemoryStorage()
    const first = createThemeScopeStore({ scopeId: "dark-override", storage })
    first.getState().setPrimaryColor("#445566")
    first.getState().setDarkMode(true)

    const restored = createThemeScopeStore({ scopeId: "dark-override", storage })
    await restored.persist.rehydrate()

    expect(restored.getState().overrides).toEqual({ primaryColor: "#445566" })
    expect(restored.getState().isDarkModeEnabled).toBe(true)
  })

  it("handles undefined dark mode (inherits from root) on restore", async () => {
    const storage = new MemoryStorage()
    const store = createThemeScopeStore({
      scopeId: "inherit-mode",
      darkModeEnabled: undefined,
      storage,
    })

    store.getState().setDarkMode(undefined)
    await store.persist.rehydrate()

    expect(store.getState().isDarkModeEnabled).toBeUndefined()
  })
})
