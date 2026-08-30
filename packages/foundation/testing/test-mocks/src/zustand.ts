import type { StateCreator } from "zustand"
import type { SliceCreator } from "@repo/shared-contracts/types"

/**
 * @module zustand
 * Shared type fixtures for testing Zustand store patterns across the monorepo.
 * These interfaces document the expected contract for creating stores with
 * proper TypeScript type inference.
 *
 * Use these as templates when creating new stores in tests or as reference
 * implementations for store architecture decisions.
 */

// ============================================================================
// Store Type Fixtures
// ============================================================================

/**
 * Basic store creator without middleware
 * Template for simple state + action patterns
 */
export interface BasicState {
  count: number
  increment: () => void
}

export const basicStateCreator: StateCreator<BasicState, [], []> = (set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
})

/**
 * Store creator with complex state and actions
 * Template for nested objects and computed updates
 */
export interface ComplexState {
  user: { name: string; age: number }
  settings: { theme: "light" | "dark" }
  setUser: (user: ComplexState["user"]) => void
  updateTheme: (theme: "light" | "dark") => void
}

export const complexStateCreator: StateCreator<ComplexState, [], []> = (
  set
) => ({
  user: { name: "John", age: 30 },
  settings: { theme: "light" },
  setUser: (user) => set({ user }),
  updateTheme: (theme) =>
    set((state) => ({ settings: { ...state.settings, theme } })),
})

/**
 * Store creator with async actions
 * Template for async operations with loading states
 */
export interface AsyncState {
  loading: boolean
  data: string | null
  fetchData: () => Promise<void>
}

export const asyncStateCreator: StateCreator<AsyncState, [], []> = (set) => ({
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

/**
 * Store creator with Zustand persist middleware
 * Template for persistence patterns (using create directly for middleware support)
 */
export interface PersistedState {
  count: number
  increment: () => void
}

/**
 * Type signatures for invalid store patterns
 * Use with @ts-expect-error in tests to verify type safety
 */

/**
 * Missing required state property - should fail type checking
 */
export interface RequiredState {
  count: number
  increment: () => void
}

/**
 * Wrong action parameter type - should fail type checking
 */
export interface ActionState {
  setValue: (value: number) => void
}

export interface TestState {
  count: number
  user: { id: string; name: string; age: number }
  theme: "light" | "dark"
  increment?: () => void
  decrement?: () => void
  selectors?: Record<string, unknown>
}

export interface AuthState {
  user: string | null
  login: (username: string) => void
  logout: () => void
}

export interface ThemeState {
  theme: "light" | "dark"
  toggleTheme: () => void
}
export interface UiState {
  showMenu?: () => boolean
}

export interface AppState extends AuthState, ThemeState {}

export const createAuthSlice: SliceCreator<AppState, AuthState> = (
  set: (partial: Partial<AppState>) => void
) => ({
  user: null,
  login: (username: string) => set({ user: username }),
  logout: () => set({ user: null }),
})

export const createThemeSlice: SliceCreator<AppState, ThemeState> = (
  set: (partial: Partial<ThemeState>) => void
) => ({
  theme: "light",
  toggleTheme: () => set({ theme: "dark" }),
})
