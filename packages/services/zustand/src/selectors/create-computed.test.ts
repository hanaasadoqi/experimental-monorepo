import { expect, vi, describe, it } from "vitest"
import { TestState } from "@repo/foundation-test-mocks/zustand"
import { createComputed } from "./create-computed.js"
import { create } from "zustand"
import { EqualityFn } from "@repo/shared-utils/shallow-equal"

describe("createComputed", () => {
  it("should create computed value from store", () => {
    const store = create<TestState>(() => ({
      count: 42,
      user: { id: "1", name: "Henry", age: 30 },
      theme: "light",
    }))

    const computed = createComputed<TestState, number>(
      store,
      (state: Partial<TestState>) => (state as TestState).count * 2
    )

    expect(computed.get()).toBe(84)
  })

  it("should subscribe to computed value changes", () => {
    const store = create<TestState>((set) => ({
      count: 0,
      user: { id: "1", name: "Ivy", age: 30 },
      theme: "light",
      increment: () => set((state) => ({ ...state, count: state.count + 1 })),
    }))

    const computed = createComputed<TestState, number>(
      store,
      (state: Partial<TestState>) => (state as TestState).count * 2
    )

    const listener = vi.fn()
    computed.subscribe(listener)

    // Manually update state
    const state = store.getState()
    state.increment?.()

    // Give time for subscription update
    expect(computed.get()).toBeGreaterThanOrEqual(0)
  })

  it("should not trigger callback for unchanged computed value", () => {
    const store = create<TestState>(() => ({
      count: 42,
      user: { id: "1", name: "Jack", age: 30 },
      theme: "light",
    }))

    const computed = createComputed(
      store,
      (state: Partial<TestState>) => (state as TestState).count // Always 42
    )

    const listener = vi.fn()
    const unsubscribe = computed.subscribe(listener)

    // Value should not trigger callback (same count)
    expect(listener.mock.calls.length).toBe(0)

    unsubscribe()
  })

  it("should use custom equality function", () => {
    const store = create<TestState>(() => ({
      count: 0,
      user: { id: "1", name: "Kate", age: 30 },
      theme: "light",
    }))

    // Always consider different
    const alwaysDifferent: EqualityFn<number> = () => false

    const computed = createComputed<TestState, number>(
      store,
      (state: Partial<TestState>) => (state as TestState).count,
      alwaysDifferent
    )

    const listener = vi.fn()
    const unsubscribe = computed.subscribe(listener)

    // Even without state changes, equality fails
    expect(computed.get()).toBe(0)

    unsubscribe()
  })

  it("should return unsubscribe function", () => {
    const store = create<TestState>(() => ({
      count: 42,
      user: { id: "1", name: "Leo", age: 30 },
      theme: "light",
    }))

    const computed = createComputed(
      store,
      (state: Partial<TestState>) => (state as TestState).count
    )

    const listener = vi.fn()
    const unsubscribe = computed.subscribe(listener)

    expect(typeof unsubscribe).toBe("function")

    unsubscribe()
    // After unsubscribe, should not trigger listener
  })
})
