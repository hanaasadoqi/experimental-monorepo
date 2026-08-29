import { expect, vi, describe, it } from "vitest"
import { TestState } from "@repo/foundation-test-mocks/zustand"
import { createSelector } from "./create-selector.js"

describe("createSelector", () => {
  it("should create a basic selector", () => {
    const selectCount = createSelector<TestState, number>(
      (state: Partial<TestState>) => (state as TestState).count
    )

    const state: TestState = {
      count: 42,
      user: { id: "1", name: "John", age: 30 },
      theme: "light",
    }

    expect(selectCount(state)).toBe(42)
  })

  it("should memoize selector result with default equality", () => {
    const selector = vi.fn((state: TestState) => state.count)
    const memoizedSelector = createSelector(selector)

    const state1: TestState = {
      count: 42,
      user: { id: "1", name: "John", age: 30 },
      theme: "light",
    }

    // First call
    const result1 = memoizedSelector(state1)
    expect(result1).toBe(42)
    expect(selector).toHaveBeenCalledTimes(1)

    // Second call with same state
    const result2 = memoizedSelector(state1)
    expect(result2).toBe(42)
    expect(selector).toHaveBeenCalledTimes(2) // Selector still called
  })

  it("should use custom equality function", () => {
    const customEqual = vi.fn((a: number, b: number) => a === b)
    const selector = vi.fn((state: TestState) => state.count)
    const memoizedSelector = createSelector(selector, customEqual)

    const state1: TestState = {
      count: 42,
      user: { id: "1", name: "John", age: 30 },
      theme: "light",
    }

    memoizedSelector(state1)
    memoizedSelector(state1) // Same state

    expect(customEqual).toHaveBeenCalled()
  })

  it("should return stable reference when value unchanged", () => {
    const memoizedSelector = createSelector<TestState, number | undefined>(
      (state: Partial<TestState>) => state.count
    )

    const state: TestState = {
      count: 42,
      user: { id: "1", name: "John", age: 30 },
      theme: "light",
    }

    const result1 = memoizedSelector(state)
    const result2 = memoizedSelector(state)

    expect(result1).toBe(result2)
  })

  it("should handle undefined initial value", () => {
    const memoizedSelector = createSelector<TestState, number | undefined>(
      (state: Partial<TestState>) =>
        (state as TestState).count > 50 ? (state as TestState).count : undefined
    )

    const state1: TestState = {
      count: 42,
      user: { id: "1", name: "John", age: 30 },
      theme: "light",
    }

    expect(memoizedSelector(state1)).toBeUndefined()
  })
})
