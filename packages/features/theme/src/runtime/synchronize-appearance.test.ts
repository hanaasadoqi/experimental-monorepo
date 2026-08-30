import { beforeEach, describe, expect, it, vi } from "vitest"
import type { StoreApi } from "zustand"

import { synchronizeAppearance } from "./synchronize-appearance"
import { createAppearanceStore } from "../store/appearance-store"
import type { AppearancePersistenceAdapter } from "../persistence/types"
import type { AppearancePreference, AppearanceState } from "../types"
import { createMatchMedia, createMatchMediaMock } from "@repo/foundation-test-mocks"

function createMockAdapter(): AppearancePersistenceAdapter & {
  emit: (preference: AppearancePreference) => void
  listeners: Array<(preference: AppearancePreference) => void>
} {
  const listeners: Array<(preference: AppearancePreference) => void> = []

  return {
    read: vi.fn(() => null),
    write: vi.fn(),
    subscribe: vi.fn((listener: (preference: AppearancePreference) => void) => {
      listeners.push(listener)
      return () => {
        const index = listeners.indexOf(listener)
        if (index !== -1) {
          listeners.splice(index, 1)
        }
      }
    }),
    listeners,
    emit(preference: AppearancePreference) {
      for (const listener of [...listeners]) {
        listener(preference)
      }
    },
  }
}

describe("synchronizeAppearance", () => {
  let element: HTMLElement
  let store: StoreApi<AppearanceState>
  let adapter: ReturnType<typeof createMockAdapter>
  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    element = document.createElement("html")
    store = createAppearanceStore("system", "light")
    adapter = createMockAdapter()
    originalMatchMedia = window.matchMedia
  })

  it("applies the initial DOM state from the current store preference on mount", () => {
    const matchMedia = createMatchMedia(false)
    window.matchMedia = matchMedia

    const localStore = createAppearanceStore("dark", "light")
    const dispose = synchronizeAppearance(localStore, adapter, element)

    expect(element.classList.contains("dark")).toBe(true)
    expect(element.getAttribute("data-theme")).toBe("dark")
    expect(element.style.colorScheme).toBe("dark")

    dispose()
    window.matchMedia = originalMatchMedia
  })

  it("updates the DOM and persists via the adapter when the store preference changes", () => {
    const { matchMedia } = createMatchMediaMock(false, { fn: vi.fn })
    window.matchMedia = matchMedia

    const dispose = synchronizeAppearance(store, adapter, element)

    store.getState().setPreference("dark")

    expect(element.classList.contains("dark")).toBe(true)
    expect(element.getAttribute("data-theme")).toBe("dark")
    expect(element.style.colorScheme).toBe("dark")
    expect(adapter.write).toHaveBeenCalledWith("dark")

    dispose()
    window.matchMedia = originalMatchMedia
  })

  it("updates the DOM when system media changes and preference is 'system'", () => {
    const { matchMedia, fireChange } = createMatchMediaMock(false, { fn: vi.fn })
    window.matchMedia = matchMedia

    const dispose = synchronizeAppearance(store, adapter, element)
    expect(element.getAttribute("data-theme")).toBe("light")

    fireChange(true)

    expect(element.classList.contains("dark")).toBe(true)
    expect(element.getAttribute("data-theme")).toBe("dark")
    expect(element.style.colorScheme).toBe("dark")

    dispose()
    window.matchMedia = originalMatchMedia
  })

  it("does not update the DOM from system media changes when preference is not 'system'", () => {
    const { matchMedia, fireChange } = createMatchMediaMock(false, { fn: vi.fn })
    window.matchMedia = matchMedia

    const localStore = createAppearanceStore("light", "light")
    const dispose = synchronizeAppearance(localStore, adapter, element)
    expect(element.getAttribute("data-theme")).toBe("light")

    fireChange(true)

    expect(element.getAttribute("data-theme")).toBe("light")
    expect(element.classList.contains("dark")).toBe(false)

    dispose()
    window.matchMedia = originalMatchMedia
  })

  it("updates the store when the adapter reports an external preference change", () => {
    const { matchMedia } = createMatchMediaMock(false, { fn: vi.fn })
    window.matchMedia = matchMedia

    const dispose = synchronizeAppearance(store, adapter, element)

    adapter.emit("dark")

    expect(store.getState().preference).toBe("dark")
    expect(store.getState().resolvedColorScheme).toBe("dark")
    expect(element.getAttribute("data-theme")).toBe("dark")

    dispose()
    window.matchMedia = originalMatchMedia
  })

  it("does not write back to the adapter when applying an external adapter change", () => {
    const { matchMedia } = createMatchMediaMock(false)
    window.matchMedia = matchMedia

    const dispose = synchronizeAppearance(store, adapter, element)
    vi.mocked(adapter.write).mockClear()

    adapter.emit("dark")

    expect(adapter.write).not.toHaveBeenCalled()

    dispose()
    window.matchMedia = originalMatchMedia
  })

  it("cleans up all listeners on disposal", () => {
    const { matchMedia, listenerCount } = createMatchMediaMock(false)
    window.matchMedia = matchMedia

    const dispose = synchronizeAppearance(store, adapter, element)
    expect(listenerCount()).toBe(1)
    expect(adapter.listeners).toHaveLength(1)

    dispose()

    expect(listenerCount()).toBe(0)
    expect(adapter.listeners).toHaveLength(0)

    window.matchMedia = originalMatchMedia
  })

  it("no longer updates the DOM or store after disposal", () => {
    const { matchMedia, fireChange } = createMatchMediaMock(false)
    window.matchMedia = matchMedia

    const dispose = synchronizeAppearance(store, adapter, element)
    dispose()

    store.getState().setPreference("dark")
    expect(element.getAttribute("data-theme")).toBe("light")

    fireChange(true)
    expect(element.getAttribute("data-theme")).toBe("light")

    const preferenceBeforeEmit = store.getState().preference
    adapter.emit("light")
    expect(store.getState().preference).toBe(preferenceBeforeEmit)

    window.matchMedia = originalMatchMedia
  })

  it("is idempotent: calling the disposer multiple times is safe", () => {
    const { matchMedia } = createMatchMediaMock(false)
    window.matchMedia = matchMedia

    const dispose = synchronizeAppearance(store, adapter, element)

    expect(() => {
      dispose()
      dispose()
      dispose()
    }).not.toThrow()

    window.matchMedia = originalMatchMedia
  })

  it("keeps .dark class, data-theme, and color-scheme synchronized through every transition", () => {
    const { matchMedia, fireChange } = createMatchMediaMock(false)
    window.matchMedia = matchMedia

    const dispose = synchronizeAppearance(store, adapter, element)

    function assertConsistent() {
      const theme = element.getAttribute("data-theme")
      expect(element.classList.contains("dark")).toBe(theme === "dark")
      expect(element.style.colorScheme).toBe(theme)
    }

    assertConsistent()
    store.getState().setPreference("dark")
    assertConsistent()
    store.getState().setPreference("system")
    assertConsistent()
    fireChange(true)
    assertConsistent()
    adapter.emit("light")
    assertConsistent()

    dispose()
    window.matchMedia = originalMatchMedia
  })

  it("does not throw when matchMedia is unavailable (SSR-safe)", () => {
    // @ts-expect-error simulating an environment without matchMedia
    window.matchMedia = undefined

    let dispose: () => void = () => {}
    expect(() => {
      dispose = synchronizeAppearance(store, adapter, element)
    }).not.toThrow()

    expect(element.getAttribute("data-theme")).toBe("light")

    dispose()
    window.matchMedia = originalMatchMedia
  })

  it("gracefully handles matchMedia() throwing an error during readSystemMatches", () => {
    const throwingMatchMedia = vi
      .fn()
      .mockImplementation(() => {
        throw new Error("matchMedia error")
      })

    window.matchMedia = throwingMatchMedia

    let dispose: () => void = () => {}
    expect(() => {
      dispose = synchronizeAppearance(store, adapter, element)
    }).not.toThrow()

    // Should still set initial DOM state
    expect(element.getAttribute("data-theme")).toBe("light")

    dispose()
    window.matchMedia = originalMatchMedia
  })

  it("gracefully handles matchMedia() throwing during listener setup", () => {
    const throwingMatchMedia = vi
      .fn()
      .mockImplementation(() => {
        throw new Error("matchMedia setup error")
      })

    window.matchMedia = throwingMatchMedia

    let dispose: () => void = () => {}
    expect(() => {
      dispose = synchronizeAppearance(store, adapter, element)
    }).not.toThrow()

    expect(element.getAttribute("data-theme")).toBe("light")

    // Should not throw when disposing
    expect(() => {
      dispose()
    }).not.toThrow()

    window.matchMedia = originalMatchMedia
  })

  it("handles error in readSystemMatches catch block", () => {
    // Mock window.matchMedia to throw in try block, triggering catch
    const originalFn = window.matchMedia
    window.matchMedia = (() => {
      throw new Error("System preference query failed")
    }) as unknown as typeof window.matchMedia

    const localStore = createAppearanceStore("light", "light")
    let dispose: () => void = () => {}

    expect(() => {
      dispose = synchronizeAppearance(localStore, adapter, element)
    }).not.toThrow()

    // Should still apply initial state even if readSystemMatches fails
    expect(element.getAttribute("data-theme")).toBe("light")
    expect(element.classList.contains("dark")).toBe(false)

    dispose()
    window.matchMedia = originalFn
  })

  it("preserves state even when mediaQuery setup throws", () => {
    // Create a matchMedia that throws after being called once
    let callCount = 0
    const conditionalThrowMatchMedia = vi.fn(() => {
      callCount++
      if (callCount > 1) {
        throw new Error("Media query listener setup failed")
      }
      return {
        matches: false,
        media: "(prefers-color-scheme: dark)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }
    })

    const mockMatchMedia = createMatchMedia(
      conditionalThrowMatchMedia().matches
    );

    window.matchMedia = mockMatchMedia;

    const localStore = createAppearanceStore("system", "light")
    let dispose: () => void = () => {}

    expect(() => {
      dispose = synchronizeAppearance(localStore, adapter, element)
    }).not.toThrow()

    // Should still have valid DOM state
    expect(element.getAttribute("data-theme")).toMatch(/^(light|dark)$/)

    dispose()
    window.matchMedia = originalMatchMedia
  })

  it("correctly updates DOM when system media matches changes with system preference", () => {
    const { matchMedia, fireChange } = createMatchMediaMock(false, { fn: vi.fn })
    window.matchMedia = matchMedia

    // Create store with system preference
    const systemStore = createAppearanceStore("system", "light")

    const dispose = synchronizeAppearance(systemStore, adapter, element)

    // Initial state: system prefers light (fireChange initialized to false)
    expect(element.getAttribute("data-theme")).toBe("light")
    expect(element.classList.contains("dark")).toBe(false)

    // Simulate system preference changing to dark
    fireChange(true)

    // Verify DOM updated to dark
    expect(element.getAttribute("data-theme")).toBe("dark")
    expect(element.classList.contains("dark")).toBe(true)
    expect(element.style.colorScheme).toBe("dark")

    dispose()
    window.matchMedia = originalMatchMedia
  })

  it("triggers adapter write when preference changes but not for external changes", () => {
    const matchMedia = createMatchMedia(false)
    window.matchMedia = matchMedia

    const dispose = synchronizeAppearance(store, adapter, element)

    // User preference change should trigger adapter.write
    store.getState().setPreference("dark")
    expect(adapter.write).toHaveBeenCalledWith("dark")
    expect(adapter.write).toHaveBeenCalledTimes(1)

    // External adapter change should NOT trigger another write (isApplyingExternalChange true)
    adapter.emit("light")
    expect(adapter.write).toHaveBeenCalledTimes(1)

    dispose()
    window.matchMedia = originalMatchMedia
  })

  it("applies external preference changes from adapter without loopback", () => {
    const { matchMedia } = createMatchMediaMock(false)
    window.matchMedia = matchMedia

    const dispose = synchronizeAppearance(store, adapter, element)
    expect(store.getState().preference).toBe("system")

    // Emit from adapter as if another tab changed the preference
    adapter.emit("dark")

    // Preference should update from external adapter
    expect(store.getState().preference).toBe("dark")

    // But adapter.write should not be called again (prevents feedback loop)
    expect(adapter.write).toHaveBeenCalledTimes(0)

    dispose()
    window.matchMedia = originalMatchMedia
  })
})
