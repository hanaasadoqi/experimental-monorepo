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
