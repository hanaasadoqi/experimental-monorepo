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
      version: 1,
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
})
