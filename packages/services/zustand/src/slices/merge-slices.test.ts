import { describe, it } from "node:test"
import { expect } from "vitest"
import { mergeSlices } from "./merge-slices.ts"

describe("mergeSlices", () => {
  interface CompleteState {
    auth: { user: string | null }
    theme: { mode: "light" | "dark" }
    ui: { menuOpen: boolean }
  }

  it("should merge single slice", () => {
    const slice: Partial<CompleteState> = {
      auth: { user: "john" },
    }

    const merged = mergeSlices(slice)
    expect(merged).toEqual(slice)
  })

  it("should merge multiple slices", () => {
    const authSlice: Partial<CompleteState> = {
      auth: { user: "john" },
    }

    const themeSlice: Partial<CompleteState> = {
      theme: { mode: "dark" },
    }

    const uiSlice: Partial<CompleteState> = {
      ui: { menuOpen: true },
    }

    const merged = mergeSlices(authSlice, themeSlice, uiSlice)

    expect(merged).toEqual({
      auth: { user: "john" },
      theme: { mode: "dark" },
      ui: { menuOpen: true },
    })
  })

  it("should handle slice override", () => {
    const slice1: Partial<CompleteState> = {
      auth: { user: "john" },
    }

    const slice2: Partial<CompleteState> = {
      auth: { user: "jane" },
    }

    const merged = mergeSlices(slice1, slice2)

    expect((merged as Partial<CompleteState>).auth?.user).toBe("jane")
  })

  it("should handle empty slices", () => {
    const merged = mergeSlices({}, {})
    expect(merged).toEqual({})
  })

  it("should preserve nested object structure", () => {
    const slice: Partial<CompleteState> = {
      auth: { user: "john" },
      theme: { mode: "light" },
    }

    const merged = mergeSlices(slice)

    expect(merged.auth).toEqual({ user: "john" })
    expect(merged.theme).toEqual({ mode: "light" })
  })
})
