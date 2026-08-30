import { describe, expect, it } from "vitest"

import { createPreferencesStore } from "./index"

describe("createPreferencesStore", () => {
  it("defaults the active appearance preference to system", () => {
    const store = createPreferencesStore()

    expect(store.getState().appearancePreference).toBe("system")
  })

  it("uses the supplied active appearance preference", () => {
    const store = createPreferencesStore("dark")

    expect(store.getState().appearancePreference).toBe("dark")
  })

  it("changes the active appearance preference", () => {
    const store = createPreferencesStore("light")

    store.getState().setAppearancePreference("dark")

    expect(store.getState().appearancePreference).toBe("dark")
  })

  it("isolates state between provider-ready store instances", () => {
    const first = createPreferencesStore("light")
    const second = createPreferencesStore("system")

    first.getState().setAppearancePreference("dark")

    expect(first.getState().appearancePreference).toBe("dark")
    expect(second.getState().appearancePreference).toBe("system")
  })
})
