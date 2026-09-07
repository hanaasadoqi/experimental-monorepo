import { beforeEach, describe, expect, it } from "vitest"

import { createPreferencesStore } from "./create-preferences-store.js"

describe("createPreferencesStore", () => {
  beforeEach(() => {
    // Clear localStorage before each test since persist middleware shares state
    localStorage.clear()
  })
  it("initializes with the default preferences", () => {
    const store = createPreferencesStore()

    const state = store.getState()
    expect(state.appearance).toBe("system")
    expect(state.language).toBe("en")
  })

  it.each(["light", "dark", "system"] as const)(
    "accepts %s as an initial appearance preference",
    (appearance) => {
      const store = createPreferencesStore({ initialState: { appearance } })

      expect(store.getState().appearance).toBe(appearance)
    }
  )

  it("initializes with a custom language", () => {
    const store = createPreferencesStore({
      initialState: { language: "es" },
    })

    expect(store.getState().language).toBe("es")
  })

  it("changes the appearance preference", () => {
    const store = createPreferencesStore({
      initialState: { appearance: "light" },
    })

    store.getState().setAppearance("dark")

    expect(store.getState().appearance).toBe("dark")
  })

  it("changes the language preference", () => {
    const store = createPreferencesStore({
      initialState: { language: "en" },
    })

    store.getState().setLanguage("fr")

    expect(store.getState().language).toBe("fr")
  })

  it("changes the date format preference", () => {
    const store = createPreferencesStore({
      initialState: { dateFormat: "mm/dd/yyyy" },
    })

    store.getState().setDateFormat("dd/mm/yyyy")

    expect(store.getState().dateFormat).toBe("dd/mm/yyyy")
  })

  it("changes the time format preference", () => {
    const store = createPreferencesStore({
      initialState: { timeFormat: "12h" },
    })

    store.getState().setTimeFormat("24h")

    expect(store.getState().timeFormat).toBe("24h")
  })

  it("keeps separate store instances isolated", () => {
    const firstStore = createPreferencesStore({
      initialState: { appearance: "light", language: "en" },
    })
    const secondStore = createPreferencesStore({
      initialState: { appearance: "dark", language: "es" },
    })

    firstStore.getState().setAppearance("system")
    firstStore.getState().setLanguage("fr")

    expect(firstStore.getState()).toMatchObject({
      appearance: "system",
      language: "fr",
    })
    expect(secondStore.getState()).toMatchObject({
      appearance: "dark",
      language: "es",
    })
  })

  it("does not persist a server-provided initial state by default", () => {
    const store = createPreferencesStore({
      initialState: { appearance: "light" },
    })

    store.getState().setAppearance("dark")

    expect(localStorage.getItem("preferences-store")).toBeNull()
  })

  it("allows persistence to be explicitly enabled with an initial state", () => {
    const store = createPreferencesStore({
      initialState: { appearance: "light" },
      enablePersistence: true,
    })

    store.getState().setAppearance("dark")

    expect(localStorage.getItem("preferences-store")).toContain(
      '"appearance":"dark"'
    )
  })
})
