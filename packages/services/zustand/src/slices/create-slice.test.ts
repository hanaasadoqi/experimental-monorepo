import { describe, it } from "node:test"
import { expect } from "vitest"
import { SliceCreator } from "../types/index.ts"
import { createSlice } from "./create-slice.ts"

describe("createSlice", () => {
  interface AuthSlice {
    user: string | null
    login: (username: string) => void
    logout: () => void
  }

  interface AppState {
    user: string | null
    login: (username: string) => void
    logout: () => void
  }

  it("should create a slice", () => {
    const createAuthSlice: SliceCreator<AppState, AuthSlice> = (set) => ({
      user: null,
      login: (username: string) =>
        set((state) => ({ ...state, user: username })),
      logout: () => set((state) => ({ ...state, user: null })),
    })

    const slice = createSlice(createAuthSlice)
    expect(typeof slice).toBe("function")
  })

  it("should preserve slice creator function", () => {
    const originalFn = (_set: unknown) => ({ value: 42 })
    const slice = createSlice(originalFn)
    expect(slice).toBe(originalFn)
  })
})
