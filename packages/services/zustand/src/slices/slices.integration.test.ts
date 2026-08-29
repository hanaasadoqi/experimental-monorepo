import { describe, it, expect } from "vitest"
import { create } from "zustand"
import {
  composeSlices,
  mergeSlices,
  createSliceSelector,
  validateSlices,
} from "./index.ts"
import { SliceCreator } from "../types/index.ts"

describe("Integration: Full Slice Workflow", () => {
  interface AuthSliceState {
    user: string | null
    login: (username: string) => void
    logout: () => void
  }

  interface ThemeSliceState {
    theme: "light" | "dark"
    toggleTheme: () => void
  }

  interface SettingsSliceState {
    language: string
    setLanguage: (lang: string) => void
  }

  interface CompleteAppState
    extends AuthSliceState, ThemeSliceState, SettingsSliceState {}

  it("should compose, validate, and use slices together", () => {
    const createAuthSlice: SliceCreator<CompleteAppState, AuthSliceState> = (
      set
    ) => ({
      user: null,
      login: (username: string) => set({ user: username }),
      logout: () => set({ user: null }),
    })

    const createThemeSlice: SliceCreator<CompleteAppState, ThemeSliceState> = (
      set
    ) => ({
      theme: "light",
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
    })

    const createSettingsSlice: SliceCreator<
      CompleteAppState,
      SettingsSliceState
    > = (set) => ({
      language: "en",
      setLanguage: (lang: string) => set({ language: lang }),
    })

    const store = create<CompleteAppState>(
      composeSlices(createAuthSlice, createThemeSlice, createSettingsSlice)
    )

    // Validate all slices are present
    const isValid = validateSlices(
      store.getState() as Partial<CompleteAppState>,
      ["user", "theme", "language"]
    )
    expect(isValid).toBe(true)

    // Use selectors
    const selectUser = createSliceSelector<CompleteAppState, "user">("user")
    expect(selectUser(store.getState())).toBeNull()

    // Modify state
    store.getState().login("alice")
    expect(selectUser(store.getState())).toBe("alice")

    store.getState().toggleTheme()
    expect(store.getState().theme).toBe("dark")

    store.getState().setLanguage("es")
    expect(store.getState().language).toBe("es")
  })

  it("should merge partial slices correctly", () => {
    const authPart: Partial<CompleteAppState> = {
      user: "bob",
      login: () => {},
      logout: () => {},
    }

    const themePart: Partial<CompleteAppState> = {
      theme: "dark",
      toggleTheme: () => {},
    }

    const settingsPart: Partial<CompleteAppState> = {
      language: "fr",
      setLanguage: () => {},
    }

    const merged = mergeSlices(authPart, themePart, settingsPart)

    expect(merged.user).toBe("bob")
    expect(merged.theme).toBe("dark")
    expect(merged.language).toBe("fr")
  })
})
