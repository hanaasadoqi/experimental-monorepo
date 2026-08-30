/* eslint-disable @typescript-eslint/no-explicit-any */

import { MemoryStorage } from "./storage.js"

export function createMatchMedia(
  matches = false
): (query: string) => MediaQueryList {
  return (query: string): MediaQueryList =>
    ({
      addEventListener: () => undefined,
      addListener: () => undefined,
      dispatchEvent: () => true,
      matches,
      media: query,
      onchange: null,
      removeEventListener: () => undefined,
      removeListener: () => undefined,
    }) as MediaQueryList
}

export function createMatchMediaMock(
  initialMatches: boolean
): {
  matchMedia: typeof window.matchMedia
  fireChange: (matches: boolean) => void
  listenerCount: () => number
  } {
  let matches = initialMatches
  const changeListeners = new Set<(event: MediaQueryListEvent) => void>()

  const mql: MediaQueryList = {
    get matches() {
      return matches
    },
    media: "(prefers-color-scheme: dark)",
    addEventListener(type: string, listener: (event: MediaQueryListEvent) => void) {
      if (type === "change") {
        changeListeners.add(listener)
      }
    },
    removeEventListener(type: string, listener: (event: MediaQueryListEvent) => void) {
      if (type === "change") {
        changeListeners.delete(listener)
      }
    },
    addListener() { },
    removeListener() { },
    onchange: null,
    dispatchEvent() {
      return true
    },
  } as unknown as MediaQueryList

  const matchMediaFn = (() => mql) as unknown as typeof window.matchMedia

  return {
    matchMedia: matchMediaFn,
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

class MockResizeObserver {
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
}

class MockIntersectionObserver {
  readonly root = null
  readonly rootMargin = "0px"
  readonly thresholds = [0]

  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
  unobserve(): void {}
}

export function installBrowserMocks(target: object = globalThis): void {
  const values = {
    IntersectionObserver: MockIntersectionObserver,
    ResizeObserver: MockResizeObserver,
    localStorage: new MemoryStorage(),
    matchMedia: createMatchMedia(),
    sessionStorage: new MemoryStorage(),
  }

  for (const [key, value] of Object.entries(values)) {
    if (!(key in target)) {
      Object.defineProperty(target, key, {
        configurable: true,
        value,
        writable: true,
      })
    }
  }
}
