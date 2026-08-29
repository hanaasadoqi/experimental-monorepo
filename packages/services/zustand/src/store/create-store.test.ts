import { describe, expect, it } from "vitest"

import { createStore } from "./create-store.ts"

describe("createStore", () => {
  it("creates a typed store with initial state", () => {
    interface State {
      count: number
      increment: () => void
    }

    const store = createStore<State>(
      (
        set: (
          update: Partial<State> | ((state: State) => Partial<State>)
        ) => void
      ) => ({
        count: 0,
        increment: () => set((state: State) => ({ count: state.count + 1 })),
      })
    )

    expect(store.getState().count).toBe(0)
  })

  it("increments store state correctly", () => {
    interface State {
      count: number
      increment: () => void
    }

    const store = createStore<State>(
      (
        set: (
          update: Partial<State> | ((state: State) => Partial<State>)
        ) => void
      ) => ({
        count: 0,
        increment: () => set((state: State) => ({ count: state.count + 1 })),
      })
    )

    store.getState().increment()
    expect(store.getState().count).toBe(1)

    store.getState().increment()
    expect(store.getState().count).toBe(2)
  })

  it("supports named stores for devtools", () => {
    interface State {
      value: string
    }

    const store = createStore<State>(() => ({
      value: "test",
    }))

    expect(store.getState().value).toBe("test")
  })

  it("supports complex state updates", () => {
    interface State {
      user: { name: string; age: number }
      setUser: (user: State["user"]) => void
    }

    const store = createStore<State>(
      (
        set: (
          update: Partial<State> | ((state: State) => Partial<State>)
        ) => void
      ) => ({
        user: { name: "John", age: 30 },
        setUser: (user: State["user"]) => set({ user }),
      })
    )

    expect(store.getState().user.name).toBe("John")

    store.getState().setUser({ name: "Jane", age: 25 })
    expect(store.getState().user.name).toBe("Jane")
    expect(store.getState().user.age).toBe(25)
  })

  it("allows subscribing to store changes", () => {
    interface State {
      count: number
      increment: () => void
    }

    const store = createStore<State>(
      (
        set: (
          update: Partial<State> | ((state: State) => Partial<State>)
        ) => void
      ) => ({
        count: 0,
        increment: () => set((state: State) => ({ count: state.count + 1 })),
      })
    )

    let subscriberCallCount = 0
    const unsubscribe = store.subscribe(() => {
      subscriberCallCount += 1
    })

    expect(subscriberCallCount).toBe(0)

    store.getState().increment()
    expect(subscriberCallCount).toBe(1)

    store.getState().increment()
    expect(subscriberCallCount).toBe(2)

    unsubscribe()
    store.getState().increment()
    expect(subscriberCallCount).toBe(2)
  })
})
