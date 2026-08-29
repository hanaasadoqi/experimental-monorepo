import { beforeEach, describe, expect, it, vi } from "vitest"
import type { StoreApi } from "zustand"

import { synchronizeAppearance } from "./synchronize-appearance"
import { createAppearanceStore } from "../store/appearance-store"
import type { AppearancePersistenceAdapter } from "../persistence/types"
import type { AppearancePreference, AppearanceState } from "../types"

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

function createMatchMediaMock(initialMatches: boolean): {
  matchMedia: typeof window.matchMedia
  fireChange: (matches: boolean) => void
  listenerCount: () => number
} {
  let matches = initialMatches
  const changeListeners = new Set<(event: MediaQueryListEvent) => void>()

  const mql = {
    get matches() {
      return matches
    },
    media: "(prefers-color-scheme: dark)",
    addEventListener: vi.fn(
      (type: string, listener: (event: MediaQueryListEvent) => void) => {
        if (type === "change") {
          changeListeners.add(listener)
        }
      }
    ),
    removeEventListener: vi.fn(
      (type: string, listener: (event: MediaQueryListEvent) => void) => {
        if (type === "change") {
          changeListeners.delete(listener)
        }
      }
    ),
  }

  return {
    matchMedia: vi
      .fn()
      .mockReturnValue(mql) as unknown as typeof window.matchMedia,
    fireChange(nextMatches: boolean) {
      matches = nextMatches
      for (const listener of [...changeListeners]) {
        listener({ matches: nextMatches } as MediaQueryListEvent)
      }
    },
    listenerCount() {
      return changeListeners.size
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
    const { matchMedia } = createMatchMediaMock(false)
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
    const { matchMedia } = createMatchMediaMock(false)
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
    const { matchMedia, fireChange } = createMatchMediaMock(false)
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
    const { matchMedia, fireChange } = createMatchMediaMock(false)
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
    const { matchMedia } = createMatchMediaMock(false)
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
})
