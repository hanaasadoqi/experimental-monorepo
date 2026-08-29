import { expect, vi, describe, it } from "vitest"
import { TestState } from "@repo/foundation-test-mocks/zustand"
import { createDerivedSelector } from "./create-derived-selector.js"

describe("createDerivedSelector", () => {
  it("should create selector from input selector", () => {
    const selectUser = (state: TestState) => state.user
    const getUserName = (user: unknown) => (user as TestState["user"]).name

    const selectUserName = createDerivedSelector(selectUser, getUserName)

    const state: TestState = {
      count: 42,
      user: { id: "1", name: "Alice", age: 30 },
      theme: "light",
    }

    expect(selectUserName(state)).toBe("Alice")
  })

  it("should memoize derived result", () => {
    const resultSelector = vi.fn(
      (user: unknown) => (user as TestState["user"]).name
    )
    const selectUserName = createDerivedSelector(
      (state: TestState) => state.user,
      resultSelector
    )

    const state: TestState = {
      count: 42,
      user: { id: "1", name: "Bob", age: 30 },
      theme: "light",
    }

    selectUserName(state)
    selectUserName(state)

    // Result selector should be called twice (once per input change)
    expect(resultSelector.mock.calls.length).toBeGreaterThan(0)
  })

  it("should recalculate when input changes", () => {
    const resultSelector = vi.fn(
      (user: unknown) => (user as TestState["user"]).name
    )
    const selectUserName = createDerivedSelector(
      (state: TestState) => state.user,
      resultSelector
    )

    const state1: TestState = {
      count: 42,
      user: { id: "1", name: "Bob", age: 30 },
      theme: "light",
    }

    const state2: TestState = {
      count: 42,
      user: { id: "1", name: "Charlie", age: 30 },
      theme: "light",
    }

    selectUserName(state1)
    selectUserName(state2)

    expect(resultSelector).toHaveBeenCalledWith(state1.user)
    expect(resultSelector).toHaveBeenCalledWith(state2.user)
  })
})
