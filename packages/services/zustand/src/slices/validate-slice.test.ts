import { expect, it, describe } from "vitest"
import { validateSlices } from "./validate-slice.ts"

describe("validateSlices", () => {
  interface CompleteState {
    auth: Record<string, unknown>
    theme: Record<string, unknown>
    ui: Record<string, unknown>
  }

  it("should validate all required slices present", () => {
    const state: CompleteState = {
      auth: { user: "john" },
      theme: { mode: "dark" },
      ui: { menuOpen: true },
    }

    const isValid = validateSlices(state as Partial<CompleteState>, [
      "auth",
      "theme",
      "ui",
    ])
    expect(isValid).toBe(true)
  })

  it("should invalidate missing slices", () => {
    const state: Partial<CompleteState> = {
      auth: { user: "john" },
      theme: { mode: "dark" },
    }

    const isValid = validateSlices(state as Partial<CompleteState>, [
      "auth",
      "theme",
      "ui",
    ])
    expect(isValid).toBe(false)
  })

  it("should validate subset of required slices", () => {
    const state: CompleteState = {
      auth: { user: "john" },
      theme: { mode: "dark" },
      ui: { menuOpen: true },
    }

    const isValid = validateSlices(state as Partial<CompleteState>, [
      "auth",
      "theme",
    ])
    expect(isValid).toBe(true)
  })

  it("should handle empty required slices array", () => {
    const state: CompleteState = {
      auth: { user: "john" },
      theme: { mode: "dark" },
      ui: { menuOpen: true },
    }

    const isValid = validateSlices(
      state as unknown as Record<string, unknown>,
      []
    )
    expect(isValid).toBe(true)
  })

  it("should validate single required slice", () => {
    const state: Partial<CompleteState> = {
      auth: { user: "john" },
    }

    const isValid = validateSlices(state, ["auth"])
    expect(isValid).toBe(true)
  })

  it("should check exact property existence", () => {
    const state = {
      auth: undefined,
      theme: null,
    }

    const isValid = validateSlices(state, ["auth", "theme"])
    expect(isValid).toBe(true) // Properties exist even if undefined/null
  })
})
