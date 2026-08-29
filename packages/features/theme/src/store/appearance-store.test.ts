import { describe, expect, it, vi } from "vitest"

import {
  createAppearanceStore,
  resolveColorScheme,
  themeStore,
} from "./appearance-store"
import type {
  AppearancePreference,
  ResolvedColorScheme,
} from "../types"

describe("resolveColorScheme", () => {
  it("resolves 'light' preference to 'light' regardless of system scheme", () => {
    expect(resolveColorScheme("light", "light")).toBe("light")
    expect(resolveColorScheme("light", "dark")).toBe("light")
  })

  it("resolves 'dark' preference to 'dark' regardless of system scheme", () => {
    expect(resolveColorScheme("dark", "light")).toBe("dark")
    expect(resolveColorScheme("dark", "dark")).toBe("dark")
  })

  it("resolves 'system' preference to the given system scheme", () => {
    expect(resolveColorScheme("system", "light")).toBe("light")
    expect(resolveColorScheme("system", "dark")).toBe("dark")
  })
})

describe("createAppearanceStore", () => {
  describe("initial state", () => {
    it("defaults to 'system' preference and 'light' resolved scheme", () => {
      const store = createAppearanceStore()
      const state = store.getState()

      expect(state.preference).toBe("system")
      expect(state.resolvedColorScheme).toBe("light")
    })

    it("accepts an explicit default preference", () => {
      const store = createAppearanceStore("dark")
      expect(store.getState().preference).toBe("dark")
      expect(store.getState().resolvedColorScheme).toBe("dark")
    })

    it("accepts an explicit default system scheme", () => {
      const store = createAppearanceStore("system", "dark")
      expect(store.getState().resolvedColorScheme).toBe("dark")
    })
  })

  describe("setPreference", () => {
    it("updates preference and re-resolves the color scheme", () => {
      const store = createAppearanceStore("system", "light")

      store.getState().setPreference("dark")
      expect(store.getState().preference).toBe("dark")
      expect(store.getState().resolvedColorScheme).toBe("dark")

      store.getState().setPreference("light")
      expect(store.getState().preference).toBe("light")
      expect(store.getState().resolvedColorScheme).toBe("light")

      store.getState().setPreference("system")
      expect(store.getState().preference).toBe("system")
      expect(store.getState().resolvedColorScheme).toBe("light")
    })
  })

  describe("preference matrix (3 preferences x 2 system schemes)", () => {
    const preferences: AppearancePreference[] = ["light", "dark", "system"]
    const systemSchemes: ResolvedColorScheme[] = ["light", "dark"]
    const expected: Record<
      AppearancePreference,
      Record<ResolvedColorScheme, ResolvedColorScheme>
    > = {
      light: { light: "light", dark: "light" },
      dark: { light: "dark", dark: "dark" },
      system: { light: "light", dark: "dark" },
    }

    for (const preference of preferences) {
      for (const systemScheme of systemSchemes) {
        it(`preference=${preference}, system=${systemScheme} -> resolved=${expected[preference][systemScheme]}`, () => {
          const store = createAppearanceStore(preference, systemScheme)
          expect(store.getState().resolvedColorScheme).toBe(
            expected[preference][systemScheme]
          )
        })
      }
    }
  })

  describe("store isolation", () => {
    it("two stores maintain independent state", () => {
      const storeA = createAppearanceStore("light")
      const storeB = createAppearanceStore("dark")

      expect(storeA.getState().preference).toBe("light")
      expect(storeB.getState().preference).toBe("dark")

      storeA.getState().setPreference("dark")
      expect(storeA.getState().preference).toBe("dark")
      expect(storeB.getState().preference).toBe("dark")

      storeB.getState().setPreference("system")
      expect(storeA.getState().preference).toBe("dark")
      expect(storeB.getState().preference).toBe("system")
    })
  })

  describe("subscription", () => {
    it("notifies listeners when state changes", () => {
      const store = createAppearanceStore("system", "light")
      const listener = vi.fn()

      store.subscribe(listener)
      store.getState().setPreference("dark")

      expect(listener).toHaveBeenCalledTimes(1)
    })

    it("stops notifying after unsubscribe", () => {
      const store = createAppearanceStore("system", "light")
      const listener = vi.fn()

      const unsubscribe = store.subscribe(listener)
      unsubscribe()
      store.getState().setPreference("dark")

      expect(listener).not.toHaveBeenCalled()
    })
  })
})

describe("themeStore singleton", () => {
  it("is a module-level AppearanceState store", () => {
    expect(themeStore).toBeDefined()
    expect(typeof themeStore.getState).toBe("function")

    const state = themeStore.getState()
    expect(state).toHaveProperty("preference")
    expect(state).toHaveProperty("resolvedColorScheme")
    expect(typeof state.setPreference).toBe("function")
  })
})
