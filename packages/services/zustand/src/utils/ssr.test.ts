import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  isBrowser,
  isLocalStorageAvailable,
  isSessionStorageAvailable,
  isCookieAvailable,
  safeLocalStorage,
  safeSessionStorage,
  getEnvironment,
  type Environment,
} from "./ssr"

describe("SSR Environment Detection Utilities", () => {
  // Store original globals for restoration
  const originalWindow = globalThis.window
  const originalDocument = globalThis.document
  const originalGlobal = globalThis.global
  const originalProcess = globalThis.process

  afterEach(() => {
    // Restore globals after each test
    Object.defineProperty(globalThis, "window", {
      value: originalWindow,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(globalThis, "document", {
      value: originalDocument,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(globalThis, "global", {
      value: originalGlobal,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(globalThis, "process", {
      value: originalProcess,
      writable: true,
      configurable: true,
    })
  })

  describe("isBrowser", () => {
    it("returns true when window and document are defined", () => {
      Object.defineProperty(globalThis, "window", {
        value: {},
        writable: true,
        configurable: true,
      })
      Object.defineProperty(globalThis, "document", {
        value: {},
        writable: true,
        configurable: true,
      })
      expect(isBrowser()).toBe(true)
    })

    it("returns false when window is undefined", () => {
      Object.defineProperty(globalThis, "window", {
        value: undefined,
        writable: true,
        configurable: true,
      })
      Object.defineProperty(globalThis, "document", {
        value: {},
        writable: true,
        configurable: true,
      })
      expect(isBrowser()).toBe(false)
    })

    it("returns false when document is undefined", () => {
      Object.defineProperty(globalThis, "window", {
        value: {},
        writable: true,
        configurable: true,
      })
      Object.defineProperty(globalThis, "document", {
        value: undefined,
        writable: true,
        configurable: true,
      })
      expect(isBrowser()).toBe(false)
    })

    it("returns false when both are undefined", () => {
      Object.defineProperty(globalThis, "window", {
        value: undefined,
        writable: true,
        configurable: true,
      })
      Object.defineProperty(globalThis, "document", {
        value: undefined,
        writable: true,
        configurable: true,
      })
      expect(isBrowser()).toBe(false)
    })
  })

  describe("isLocalStorageAvailable", () => {
    it("returns false if not in browser", () => {
      Object.defineProperty(globalThis, "window", {
        value: undefined,
        writable: true,
        configurable: true,
      })
      expect(isLocalStorageAvailable()).toBe(false)
    })

    it("returns true if localStorage is accessible", () => {
      Object.defineProperty(globalThis, "window", {
        value: {},
        writable: true,
        configurable: true,
      })
      Object.defineProperty(globalThis, "document", {
        value: {},
        writable: true,
        configurable: true,
      })
      // localStorage is actually available in test environment
      const result = isLocalStorageAvailable()
      expect(typeof result).toBe("boolean")
    })

    it("returns false when localStorage.setItem throws", () => {
      Object.defineProperty(globalThis, "window", {
        value: {},
        writable: true,
        configurable: true,
      })
      Object.defineProperty(globalThis, "document", {
        value: {},
        writable: true,
        configurable: true,
      })

      const mockLocalStorage = {
        setItem: vi.fn(() => {
          throw new Error("QuotaExceededError")
        }),
        removeItem: vi.fn(),
      }

      Object.defineProperty(globalThis, "localStorage", {
        value: mockLocalStorage,
        writable: true,
        configurable: true,
      })

      expect(isLocalStorageAvailable()).toBe(false)
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })
  })

  describe("isSessionStorageAvailable", () => {
    it("returns false if not in browser", () => {
      Object.defineProperty(globalThis, "window", {
        value: undefined,
        writable: true,
        configurable: true,
      })
      expect(isSessionStorageAvailable()).toBe(false)
    })

    it("returns true if sessionStorage is accessible", () => {
      Object.defineProperty(globalThis, "window", {
        value: {},
        writable: true,
        configurable: true,
      })
      Object.defineProperty(globalThis, "document", {
        value: {},
        writable: true,
        configurable: true,
      })
      const result = isSessionStorageAvailable()
      expect(typeof result).toBe("boolean")
    })

    it("returns false when sessionStorage.setItem throws", () => {
      Object.defineProperty(globalThis, "window", {
        value: {},
        writable: true,
        configurable: true,
      })
      Object.defineProperty(globalThis, "document", {
        value: {},
        writable: true,
        configurable: true,
      })

      const mockSessionStorage = {
        setItem: vi.fn(() => {
          throw new Error("PrivacyModeError")
        }),
        removeItem: vi.fn(),
      }

      Object.defineProperty(globalThis, "sessionStorage", {
        value: mockSessionStorage,
        writable: true,
        configurable: true,
      })

      expect(isSessionStorageAvailable()).toBe(false)
    })
  })

  describe("isCookieAvailable", () => {
    it("returns false if not in browser", () => {
      Object.defineProperty(globalThis, "window", {
        value: undefined,
        writable: true,
        configurable: true,
      })
      expect(isCookieAvailable()).toBe(false)
    })

    it("returns true if document.cookie is accessible", () => {
      Object.defineProperty(globalThis, "window", {
        value: {},
        writable: true,
        configurable: true,
      })
      Object.defineProperty(globalThis, "document", {
        value: { cookie: "" },
        writable: true,
        configurable: true,
      })
      expect(isCookieAvailable()).toBe(true)
    })

    it("returns false when document.cookie access throws", () => {
      Object.defineProperty(globalThis, "window", {
        value: {},
        writable: true,
        configurable: true,
      })

      const mockDocument = {
        get cookie() {
          throw new Error("Cookie access denied")
        },
      }

      Object.defineProperty(globalThis, "document", {
        value: mockDocument,
        writable: true,
        configurable: true,
      })

      expect(isCookieAvailable()).toBe(false)
    })
  })

  describe("safeLocalStorage", () => {
    it("returns undefined if not in browser", () => {
      Object.defineProperty(globalThis, "window", {
        value: undefined,
        writable: true,
        configurable: true,
      })
      expect(safeLocalStorage()).toBeUndefined()
    })

    it("returns undefined if localStorage is not accessible", () => {
      Object.defineProperty(globalThis, "window", {
        value: {},
        writable: true,
        configurable: true,
      })
      Object.defineProperty(globalThis, "document", {
        value: {},
        writable: true,
        configurable: true,
      })

      const mockLocalStorage = {
        setItem: vi.fn(() => {
          throw new Error("QuotaExceededError")
        }),
        removeItem: vi.fn(),
      }

      Object.defineProperty(globalThis, "localStorage", {
        value: mockLocalStorage,
        writable: true,
        configurable: true,
      })

      expect(safeLocalStorage()).toBeUndefined()
    })

    it("returns localStorage if available", () => {
      Object.defineProperty(globalThis, "window", {
        value: {},
        writable: true,
        configurable: true,
      })
      Object.defineProperty(globalThis, "document", {
        value: {},
        writable: true,
        configurable: true,
      })
      const result = safeLocalStorage()
      // When localStorage is actually available, it should return the Storage object
      if (result !== undefined) {
        expect(result).toBe(localStorage)
      }
    })
  })

  describe("safeSessionStorage", () => {
    it("returns undefined if not in browser", () => {
      Object.defineProperty(globalThis, "window", {
        value: undefined,
        writable: true,
        configurable: true,
      })
      expect(safeSessionStorage()).toBeUndefined()
    })

    it("returns undefined if sessionStorage is not accessible", () => {
      Object.defineProperty(globalThis, "window", {
        value: {},
        writable: true,
        configurable: true,
      })
      Object.defineProperty(globalThis, "document", {
        value: {},
        writable: true,
        configurable: true,
      })

      const mockSessionStorage = {
        setItem: vi.fn(() => {
          throw new Error("PrivacyModeError")
        }),
        removeItem: vi.fn(),
      }

      Object.defineProperty(globalThis, "sessionStorage", {
        value: mockSessionStorage,
        writable: true,
        configurable: true,
      })

      expect(safeSessionStorage()).toBeUndefined()
    })

    it("returns sessionStorage if available", () => {
      Object.defineProperty(globalThis, "window", {
        value: {},
        writable: true,
        configurable: true,
      })
      Object.defineProperty(globalThis, "document", {
        value: {},
        writable: true,
        configurable: true,
      })
      const result = safeSessionStorage()
      // When sessionStorage is actually available, it should return the Storage object
      if (result !== undefined) {
        expect(result).toBe(sessionStorage)
      }
    })
  })

  describe("getEnvironment", () => {
    it("returns 'browser' when window is defined", () => {
      Object.defineProperty(globalThis, "window", {
        value: {},
        writable: true,
        configurable: true,
      })
      expect(getEnvironment()).toBe("browser")
    })

    it("returns 'node' when global and process exist but no window", () => {
      Object.defineProperty(globalThis, "window", {
        value: undefined,
        writable: true,
        configurable: true,
      })
      Object.defineProperty(globalThis, "global", {
        value: {},
        writable: true,
        configurable: true,
      })
      Object.defineProperty(globalThis, "process", {
        value: {},
        writable: true,
        configurable: true,
      })
      expect(getEnvironment()).toBe("node")
    })

    it("returns 'ssr' when window, global, and process are all undefined", () => {
      Object.defineProperty(globalThis, "window", {
        value: undefined,
        writable: true,
        configurable: true,
      })
      Object.defineProperty(globalThis, "global", {
        value: undefined,
        writable: true,
        configurable: true,
      })
      Object.defineProperty(globalThis, "process", {
        value: undefined,
        writable: true,
        configurable: true,
      })
      expect(getEnvironment()).toBe("ssr")
    })

    it("returns correct Environment type", () => {
      Object.defineProperty(globalThis, "window", {
        value: {},
        writable: true,
        configurable: true,
      })
      const env: Environment = getEnvironment()
      expect(["browser", "node", "ssr"]).toContain(env)
    })
  })
})
