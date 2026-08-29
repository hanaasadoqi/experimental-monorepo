import { describe, it, expect } from "vitest"
import { create } from "zustand"
import { createSelector, createShallowSelector } from "./index.ts"
import { TestState } from "@repo/foundation-test-mocks/zustand"

describe("Integration: Selector Pipeline", () => {
  it("should combine selectors for complex derivations", () => {
    const store = create<TestState>(() => ({
      count: 42,
      user: { id: "1", name: "Nancy", age: 28 },
      theme: "light",
    }))

    const selectUserInfo = createShallowSelector((state: TestState) => ({
      name: state.user.name,
      age: state.user.age,
    }))

    const selectCountDouble = createSelector(
      (state: TestState) => state.count * 2
    )

    const state = store.getState()
    expect(selectUserInfo(state)).toEqual({ name: "Nancy", age: 28 })
    expect(selectCountDouble(state)).toBe(84)
  })
})
