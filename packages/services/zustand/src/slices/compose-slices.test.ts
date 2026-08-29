import { create } from "zustand"
import { describe, it, expect } from "vitest"
import { SliceCreator, StateCreator } from "../types/index.js"
import { composeSlices } from "./compose-slices.js"

describe("composeSlices", () => {
  interface AuthState {
    user: string | null
    login: (username: string) => void
    logout: () => void
  }

  interface ThemeState {
    theme: "light" | "dark"
    toggleTheme: () => void
  }
  interface UiState {
    showMenu?: () => boolean
  }

  interface AppState extends AuthState, ThemeState {}

  const createAuthSlice: SliceCreator<AppState, AuthState> = (set) => ({
    user: null,
    login: (username: string) => set({ user: username }),
    logout: () => set({ user: null }),
  })

  const createThemeSlice: SliceCreator<AppState, ThemeState> = (set) => ({
    theme: "light",
    toggleTheme: () =>
      set((state) => ({
        theme: state.theme === "light" ? "dark" : "light",
      })),
  })

  it("should compose single slice", () => {
    const store = create<AppState>(composeSlices(createAuthSlice))

    expect(store.getState().user).toBeNull()
    expect(typeof store.getState().login).toBe("function")
  })

  it("should compose multiple slices", () => {
    const store = create<AppState>(
      composeSlices(createAuthSlice, createThemeSlice)
    )

    const state = store.getState()
    expect(state).toHaveProperty("user", null)
    expect(state).toHaveProperty("theme", "light")
    expect(typeof state.login).toBe("function")
    expect(typeof state.toggleTheme).toBe("function")
  })

  it("should allow slices to access other slices via get", () => {
    const createUISlice: SliceCreator<AppState & UiState, unknown> = (
      set,
      get
    ) => ({
      showMenu: () => {
        const currentUser = get().user
        return currentUser !== null
      },
    })

    const store = create<AppState & UiState>(
      composeSlices(
        createAuthSlice,
        createThemeSlice,
        createUISlice
      ) as StateCreator<AppState & UiState, []>
    )

    expect(typeof store.getState().showMenu).toBe("function")
  })

  it("should merge state from multiple slices", () => {
    const store = create<AppState>(
      composeSlices(createAuthSlice, createThemeSlice)
    )

    store.getState().login("john")
    store.getState().toggleTheme()

    const state = store.getState()
    expect(state.user).toBe("john")
    expect(state.theme).toBe("dark")
  })

  it("should handle empty slice composition", () => {
    const store = create<AppState>(
      composeSlices() as StateCreator<AppState, []>
    )
    expect(typeof store.getState).toBe("function")
  })

  it("should preserve slice order", () => {
    const executionOrder: string[] = []

    const firstSlice: SliceCreator<AppState, unknown> = (_set) => {
      executionOrder.push("first")
      return {}
    }

    const secondSlice: SliceCreator<AppState, unknown> = (_set) => {
      executionOrder.push("second")
      return {}
    }

    create<AppState>(
      composeSlices(firstSlice, secondSlice) as StateCreator<AppState, []>
    )

    expect(executionOrder).toContain("first")
    expect(executionOrder).toContain("second")
  })
})
