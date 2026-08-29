import { describe, it, expect } from "vitest"
import { createSelectorSet } from "./create-selector-set.js"
import type {
  AuthState,
  TestState,
  ThemeState,
} from "@repo/foundation-test-mocks/zustand"

describe("createSelectorSet", () => {
  it("should create a set of selectors", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectors = createSelectorSet<TestState, any>({
      selectCount: (state: TestState) => state.count,
      selectUserName: (state: Partial<TestState>) => state.user?.name,
      selectTheme: (state: TestState) => state.theme,
    })

    expect(selectors).toHaveProperty("selectCount")
    expect(selectors).toHaveProperty("selectUserName")
    expect(selectors).toHaveProperty("selectTheme")
  })

  it("should use selectors from set", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userSelectors = createSelectorSet<TestState, any>({
      selectUserId: (state: TestState) => state.user.id,
      selectUserName: (state: TestState) => state.user.name,
      selectUserAge: (state: TestState) => state.user.age,
    })

    const state: TestState = {
      count: 42,
      user: { id: "123", name: "Mike", age: 35 },
      theme: "dark",
    }

    expect(userSelectors.selectUserId?.(state)).toBe("123")
    expect(userSelectors.selectUserName?.(state)).toBe("Mike")
    expect(userSelectors.selectUserAge?.(state)).toBe(35)
  })

  it("should handle empty selector set", () => {
    const selectors = createSelectorSet({})
    expect(Object.keys(selectors).length).toBe(0)
  })

  it("should preserve selector function identity", () => {
    const selectCount = (state: unknown) => (state as TestState).count
    const selectTheme = (state: unknown) => (state as TestState).theme

    const selectors = createSelectorSet({
      selectCount,
      selectTheme,
    })

    expect(selectors.selectCount).toBe(selectCount)
    expect(selectors.selectTheme).toBe(selectTheme)
  })

  it("should organize selectors by domain", () => {
    type CombinedState = TestState & AuthState
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const authSelectors = createSelectorSet<CombinedState, any>({
      selectIsLoggedIn: (state: Partial<CombinedState>) => state.user !== null,
      selectUserId: (state: CombinedState) => state.user?.id,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const themeSelectors = createSelectorSet<ThemeState, any>({
      selectTheme: (state: ThemeState) => state.theme,
      selectIsDark: (state: ThemeState) => state.theme === "dark",
    })

    expect(Object.keys(authSelectors).length).toBe(2)
    expect(Object.keys(themeSelectors).length).toBe(2)
  })
})
