import type { StateCreator } from "zustand"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { createStore } from "./create-store.js"

// ============================================================================
// POSITIVE FIXTURES: Valid store creators compile correctly
// ============================================================================

/**
 * Basic store creator without middleware
 * Should compile without errors
 */
{
  interface BasicState {
    count: number
    increment: () => void
  }

  const basicCreator: StateCreator<BasicState, [], []> = (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  })

  const store = createStore<BasicState>(basicCreator)

  // Verify the store API is available
  const _count: number = store.getState().count
  store.getState().increment()
}

/**
 * Store creator with complex state and actions
 * Should compile without errors
 */
{
  interface ComplexState {
    user: { name: string; age: number }
    settings: { theme: "light" | "dark" }
    setUser: (user: ComplexState["user"]) => void
    updateTheme: (theme: "light" | "dark") => void
  }

  const complexCreator: StateCreator<ComplexState, [], []> = (set) => ({
    user: { name: "John", age: 30 },
    settings: { theme: "light" },
    setUser: (user) => set({ user }),
    updateTheme: (theme) =>
      set((state) => ({ settings: { ...state.settings, theme } })),
  })

  const store = createStore<ComplexState>(complexCreator)

  // Verify the store API is available
  const _user: ComplexState["user"] = store.getState().user
  store.getState().setUser({ name: "Jane", age: 25 })
}

/**
 * Store creator with async actions
 * Should compile without errors
 */
{
  interface AsyncState {
    loading: boolean
    data: string | null
    fetchData: () => Promise<void>
  }

  const asyncCreator: StateCreator<AsyncState, [], []> = (set) => ({
    loading: false,
    data: null,
    fetchData: async () => {
      set({ loading: true })
      try {
        const result = "fetched data"
        set({ data: result })
      } finally {
        set({ loading: false })
      }
    },
  })

  const store = createStore<AsyncState>(asyncCreator)

  // Verify the store API is available
  const _loading: boolean = store.getState().loading
  await store.getState().fetchData()
}

/**
 * Store creator with Zustand persist middleware
 * Should compile without errors (using create directly for middleware support)
 */
{
  interface PersistedState {
    count: number
    increment: () => void
  }

  // Persisted store creator pattern - using Zustand's persist middleware
  const store = create<PersistedState>()(
    persist(
      (set) => ({
        count: 0,
        increment: () => set(({ count }) => ({ count: count + 1 })),
      }),
      {
        name: "persisted-counter",
      }
    )
  )

  // Verify the store API is available
  const _count: number = store.getState().count
  store.getState().increment()
}

// ============================================================================
// NEGATIVE FIXTURES: Invalid store creators should fail type checking
// ============================================================================

/**
 * Missing required state property should fail type checking
 */
{
  interface RequiredState {
    count: number
    increment: () => void
  }

  // @ts-expect-error — 'count' is required but missing in return value
  const _invalidCreator1: StateCreator<RequiredState, []> = (set) => ({
    increment: () => set(({ count }) => ({ count: count + 1 })),
  })
}

/**
 * Wrong action parameter type should fail type checking
 */
{
  interface ActionState {
    setValue: (value: number) => void
  }

  const _invalidCreator2: StateCreator<ActionState, []> = (_set) => ({
    // @ts-expect-error — 'setValue' parameter type mismatch (string vs number)
    setValue: (_value: string) => {
      // Deliberately wrong type
    },
  })
}
