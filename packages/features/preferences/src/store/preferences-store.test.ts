import { describe, expect, it } from "vitest"

import { createPreferencesStore } from "../index"

describe("createPreferencesStore", () => {
  it("defaults the active appearance preference to system", () => {
    const store = createPreferencesStore()

    expect(store.getState().appearance).toBe("system")
  })

  it("uses the supplied active appearance preference", () => {
    const store = createPreferencesStore("dark")

    expect(store.getState().appearance).toBe("dark")
  })

  it("changes the active appearance preference", () => {
    const store = createPreferencesStore("light")

    store.getState().setAppearance("dark")

    expect(store.getState().appearance).toBe("dark")
  })

  it("isolates state between provider-ready store instances", () => {
    const first = createPreferencesStore("light")
    const second = createPreferencesStore("system")

    first.getState().setAppearance("dark")

    expect(first.getState().appearance).toBe("dark")
    expect(second.getState().appearance).toBe("system")
  })
})
