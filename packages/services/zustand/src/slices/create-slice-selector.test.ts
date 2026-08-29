import { describe, it, expect } from "vitest"
import { SliceExtractor } from "../types/index.js"
import { createSliceSelector } from "./create-slice-selector.js"

describe("createSliceSelector", () => {
  interface AppState {
    user: { id: string; name: string }
    theme: string
    notifications: number
  }

  it("should create selector for object property", () => {
    const selectUser = createSliceSelector<AppState, "user">("user")

    const state: AppState = {
      user: { id: "1", name: "John" },
      theme: "light",
      notifications: 0,
    }

    expect(selectUser(state)).toEqual({ id: "1", name: "John" })
  })

  it("should create selector for string property", () => {
    const selectTheme = createSliceSelector<AppState, "theme">("theme")

    const state: AppState = {
      user: { id: "1", name: "John" },
      theme: "dark",
      notifications: 0,
    }

    expect(selectTheme(state)).toBe("dark")
  })

  it("should create selector for number property", () => {
    const selectNotifications = createSliceSelector<AppState, "notifications">(
      "notifications"
    )

    const state: AppState = {
      user: { id: "1", name: "John" },
      theme: "light",
      notifications: 5,
    }

    expect(selectNotifications(state)).toBe(5)
  })

  it("should have correct type signature", () => {
    const selector: SliceExtractor<AppState, "user"> =
      createSliceSelector("user")

    const state: AppState = {
      user: { id: "1", name: "John" },
      theme: "light",
      notifications: 0,
    }

    const result = selector(state)
    expect(result.id).toBe("1")
    expect(result.name).toBe("John")
  })
})
