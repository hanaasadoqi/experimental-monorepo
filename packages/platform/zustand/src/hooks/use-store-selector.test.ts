import { describe, expect, it } from "vitest"

import { createStore } from "../store/index.ts"
import { createUseSelector } from "./use-store-selector.ts"

describe("createUseSelector", () => {
  it("creates a selector hook for a store", () => {
    interface State {
      count: number
      name: string
    }

    const store = createStore<State>(() => ({
      count: 0,
      name: "test",
    }))

    const useSelector = createUseSelector(store)
    expect(useSelector((state) => state.count)).toBe(0)
    expect(useSelector((state) => state.name)).toBe("test")
  })

  it("selects specific state properties", () => {
    interface State {
      user: { id: number; name: string }
      timestamp: number
    }

    const store = createStore<State>(() => ({
      user: { id: 1, name: "Alice" },
      timestamp: Date.now(),
    }))

    const useSelector = createUseSelector(store)
    const userId = useSelector((state: State) => state.user.id)
    const userName = useSelector((state: State) => state.user.name)

    expect(userId).toBe(1)
    expect(userName).toBe("Alice")
  })

  it("works with transformed selectors", () => {
    interface State {
      items: number[]
      sum: (items: number[]) => number
    }

    const store = createStore<State>(() => ({
      items: [1, 2, 3, 4, 5],
      sum: (items: number[]) => items.reduce((a, b) => a + b, 0),
    }))

    const useSelector = createUseSelector(store)
    const total = useSelector((state: State) => state.sum(state.items))

    expect(total).toBe(15)
  })

  it("returns selected state after store updates", () => {
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

    const useSelector = createUseSelector(store)

    expect(useSelector((state: State) => state.count)).toBe(0)

    store.getState().increment()
    expect(useSelector((state: State) => state.count)).toBe(1)

    store.getState().increment()
    expect(useSelector((state: State) => state.count)).toBe(2)
  })

  it("selects deeply nested state", () => {
    interface State {
      app: {
        user: {
          profile: {
            name: string
            email: string
          }
        }
      }
    }

    const store = createStore<State>(() => ({
      app: {
        user: {
          profile: {
            name: "John",
            email: "john@example.com",
          },
        },
      },
    }))

    const useSelector = createUseSelector(store)
    const email = useSelector((state: State) => state.app.user.profile.email)

    expect(email).toBe("john@example.com")
  })
})
