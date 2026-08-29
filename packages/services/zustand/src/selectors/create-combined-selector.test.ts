import { expect, vi, describe, it } from "vitest"
import { TestState } from "@repo/foundation-test-mocks/zustand"
import { createCombinedSelector } from "./create-combined-selector.js"

describe("createCombinedSelector", () => {
  it("should combine multiple selectors", () => {
    const combinedSelector = createCombinedSelector(
      [(state: TestState) => state.count, (state: TestState) => state.theme],
      (count, theme) => ({ count, theme })
    )

    const state: TestState = {
      count: 42,
      user: { id: "1", name: "John", age: 30 },
      theme: "dark",
    }

    const result = combinedSelector(state)
    expect(result).toEqual({ count: 42, theme: "dark" })
  })

  it("should memoize combined result", () => {
    const resultSelector = vi.fn((count: unknown, theme: unknown) => ({
      count,
      theme,
    }))

    const combinedSelector = createCombinedSelector(
      [(state: TestState) => state.count, (state: TestState) => state.theme],
      resultSelector
    )

    const state: TestState = {
      count: 42,
      user: { id: "1", name: "John", age: 30 },
      theme: "dark",
    }

    combinedSelector(state)
    combinedSelector(state) // Same state

    // Result selector called only when inputs change
    expect(resultSelector).toHaveBeenCalled()
  })

  it("should recalculate when any input changes", () => {
    const resultSelector = vi.fn((count: unknown) => count)

    const combinedSelector = createCombinedSelector(
      [(state: TestState) => state.count, (state: TestState) => state.theme],
      resultSelector
    )

    const state1: TestState = {
      count: 42,
      user: { id: "1", name: "John", age: 30 },
      theme: "light",
    }

    const state2: TestState = {
      ...state1,
      count: 100,
    }

    combinedSelector(state1)
    const initialCalls = resultSelector.mock.calls.length

    combinedSelector(state2)
    expect(resultSelector.mock.calls.length).toBeGreaterThan(initialCalls)
  })

  it("should handle three or more input selectors", () => {
    const combinedSelector = createCombinedSelector(
      [
        (state: TestState) => state.count,
        (state: TestState) => state.theme,
        (state: TestState) => state.user.name,
      ],
      (count, theme, name) => ({ count, theme, name })
    )

    const state: TestState = {
      count: 42,
      user: { id: "1", name: "Diana", age: 30 },
      theme: "light",
    }

    const result = combinedSelector(state)
    expect(result).toEqual({ count: 42, theme: "light", name: "Diana" })
  })
})
