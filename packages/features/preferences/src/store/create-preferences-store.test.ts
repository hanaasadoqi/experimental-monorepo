import { describe, expect, it } from "vitest"

import { createPreferencesStore } from "./create-preferences-store.js"

describe("createPreferencesStore", () => {
  it("initializes with the default preferences", () => {
    const store = createPreferencesStore()

    expect(store.getState().appearance).toBe("system")
  })

  it.each(["light", "dark", "system"] as const)(
    "accepts %s as an initial appearance preference",
    (appearance) => {
      const store = createPreferencesStore({ initialState: { appearance } })

      expect(store.getState().appearance).toBe(appearance)
    }
  )

  it("changes the appearance preference", () => {
    const store = createPreferencesStore({
      initialState: { appearance: "light" },
    })

    store.getState().setAppearance("dark")

    expect(store.getState().appearance).toBe("dark")
  })

  it("keeps separate store instances isolated", () => {
    const firstStore = createPreferencesStore({
      initialState: { appearance: "light" },
    })
    const secondStore = createPreferencesStore({
      initialState: { appearance: "dark" },
    })

    firstStore.getState().setAppearance("system")

    expect(firstStore.getState().appearance).toBe("system")
    expect(secondStore.getState().appearance).toBe("dark")
  })

  it("preserves unrelated state when changing the appearance preference", () => {
    const store = createPreferencesStore()
    const stateWithAnotherPreference = {
      ...store.getState(),
      reducedMotion: true,
    }

    store.setState(stateWithAnotherPreference)
    store.getState().setAppearance("dark")

    expect(store.getState()).toMatchObject({
      appearance: "dark",
      reducedMotion: true,
    })
  })
})
