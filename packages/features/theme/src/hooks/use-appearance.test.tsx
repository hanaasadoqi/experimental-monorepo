import { describe, it, expect, beforeEach } from "vitest"
import { render, renderHook, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  useAppearance,
  useAppearancePreference,
  useResolvedColorScheme,
  useSetAppearancePreference,
  useAppearanceControl,
} from "./use-appearance"
import {
  AppearanceProvider,
  useAppearanceStore as _,
} from "../provider/appearance-provider"
import { createLocalStorageAppearanceAdapter } from "../persistence/local-storage-adapter"

const _TestComponent = () => {
  const appearance = useAppearance()
  return <div>{appearance.preference}</div>
}

const PreferenceComponent = () => {
  const preference = useAppearancePreference()
  return <div>{preference}</div>
}

const _ColorSchemeComponent = () => {
  const scheme = useResolvedColorScheme()
  return <div>{scheme}</div>
}

const SetterComponent = () => {
  const setPreference = useSetAppearancePreference()
  return (
    <div>
      <button onClick={() => setPreference("dark")}>Set Dark</button>
    </div>
  )
}

const ControlComponent = () => {
  const [preference, setPreference] = useAppearanceControl()
  return (
    <div>
      <span>{preference}</span>
      <button onClick={() => setPreference("dark")}>Toggle</button>
    </div>
  )
}

describe("Appearance hooks", () => {
  let adapter = createLocalStorageAppearanceAdapter()

  beforeEach(() => {
    localStorage.clear()
    adapter = createLocalStorageAppearanceAdapter()
  })

  describe("useAppearance", () => {
    it("returns the complete state", () => {
      const { result } = renderHook(() => useAppearance(), {
        wrapper: ({ children }) => (
          <AppearanceProvider adapter={adapter}>{children}</AppearanceProvider>
        ),
      })
      expect(result.current).toHaveProperty("preference")
      expect(result.current).toHaveProperty("resolvedColorScheme")
      expect(result.current).toHaveProperty("setPreference")
    })
  })

  describe("useAppearancePreference", () => {
    it("reads preference and re-renders on change", async () => {
      const user = userEvent.setup()
      render(
        <AppearanceProvider adapter={adapter} defaultPreference="light">
          <PreferenceComponent />
          <SetterComponent />
        </AppearanceProvider>
      )
      expect(screen.getByText("light")).toBeTruthy()

      await user.click(screen.getByRole("button", { name: "Set Dark" }))
      expect(screen.getByText("dark")).toBeTruthy()
    })
  })

  describe("useResolvedColorScheme", () => {
    it("returns the resolved color scheme", () => {
      const { result } = renderHook(() => useResolvedColorScheme(), {
        wrapper: ({ children }) => (
          <AppearanceProvider adapter={adapter} defaultPreference="light">
            {children}
          </AppearanceProvider>
        ),
      })
      expect(result.current).toBe("light")
    })
  })

  describe("useSetAppearancePreference", () => {
    it("returns a stable setter function", async () => {
      const user = userEvent.setup()
      render(
        <AppearanceProvider adapter={adapter} defaultPreference="light">
          <PreferenceComponent />
          <SetterComponent />
        </AppearanceProvider>
      )

      await user.click(screen.getByRole("button", { name: "Set Dark" }))
      expect(screen.getByText("dark")).toBeTruthy()
    })
  })

  describe("useAppearanceControl", () => {
    it("combines preference and setter", async () => {
      const user = userEvent.setup()
      render(
        <AppearanceProvider adapter={adapter} defaultPreference="light">
          <ControlComponent />
        </AppearanceProvider>
      )

      expect(screen.getByText("light")).toBeTruthy()

      await user.click(screen.getByRole("button", { name: "Toggle" }))
      expect(screen.getByText("dark")).toBeTruthy()
    })
  })

  describe("useAppearance throws outside provider", () => {
    it("throws if used without AppearanceProvider", () => {
      expect(() => {
        renderHook(() => useAppearance())
      }).toThrow()
    })
  })
})
