import { describe, it, expect } from "vitest"
import { createShallowSelector } from "./create-shallow-selector.js"
import { TestState } from "@repo/foundation-test-mocks/zustand"

describe("createShallowSelector", () => {
  it("should create shallow-equal memoized selector for objects", () => {
    const selectUser = (state: TestState) => state.user
    const shallowSelector = createShallowSelector(selectUser)

    const state1: TestState = {
      count: 42,
      user: { id: "1", name: "Eve", age: 30 },
      theme: "light",
    }

    const result1 = shallowSelector(state1)
    expect(result1).toEqual(state1.user)
  })

  it("should return same reference for shallow-equal objects", () => {
    const selectUser = (state: TestState) => state.user
    const shallowSelector = createShallowSelector(selectUser)

    const user = { id: "1", name: "Frank", age: 30 }
    const state1: TestState = {
      count: 42,
      user,
      theme: "light",
    }

    const state2: TestState = {
      count: 42,
      user, // Same user object
      theme: "light",
    }

    const result1 = shallowSelector(state1)
    const result2 = shallowSelector(state2)

    expect(result1).toBe(result2)
  })

  it("should handle shallow comparison of objects", () => {
    const selectUser = (state: TestState) => ({
      id: state.user.id,
      name: state.user.name,
    })

    const shallowSelector = createShallowSelector(selectUser)

    const state1: TestState = {
      count: 42,
      user: { id: "1", name: "Grace", age: 30 },
      theme: "light",
    }

    const state2: TestState = {
      count: 42,
      user: { id: "1", name: "Grace", age: 31 }, // age changed, but not selected
      theme: "light",
    }

    const result1 = shallowSelector(state1)
    const result2 = shallowSelector(state2)

    // Should be equal due to shallow comparison
    expect(result1).toEqual(result2)
  })
})
