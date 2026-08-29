import { describe, expect, it } from "vitest"
import { createMatchMedia, installBrowserMocks } from "./browser.js"
import { MemoryStorage } from "./storage.js"

describe("browser mocks", () => {
  describe("createMatchMedia", () => {
    it("preserves the queried media string and configured match state", () => {
      const matchMedia = createMatchMedia(true)

      expect(matchMedia("(prefers-reduced-motion: reduce)")).toMatchObject({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
      })
    })

    it("defaults matches to false when no argument is provided", () => {
      const matchMedia = createMatchMedia()

      const result = matchMedia("(min-width: 768px)")

      expect(result.matches).toBe(false)
      expect(result.media).toBe("(min-width: 768px)")
      expect(result.onchange).toBeNull()
    })

    it("exposes no-op event methods that behave like a real MediaQueryList", () => {
      const matchMedia = createMatchMedia(false)
      const result = matchMedia("(min-width: 100px)")

      expect(result.addEventListener("change", () => undefined)).toBeUndefined()
      expect(
        result.removeEventListener("change", () => undefined)
      ).toBeUndefined()
      expect(result.addListener(() => undefined)).toBeUndefined()
      expect(result.removeListener(() => undefined)).toBeUndefined()
      expect(result.dispatchEvent(new Event("change"))).toBe(true)
    })
  })

  describe("installBrowserMocks", () => {
    it("installs missing APIs without replacing existing values", () => {
      const existingStorage = new MemoryStorage()
      const target = { localStorage: existingStorage }

      installBrowserMocks(target)

      expect(target.localStorage).toBe(existingStorage)
      expect(target).toHaveProperty("matchMedia")
      expect(target).toHaveProperty("ResizeObserver")
      expect(target).toHaveProperty("IntersectionObserver")
      expect(target).toHaveProperty("sessionStorage")
    })

    it("installs every mock API on a fully empty target", () => {
      const target = {}

      installBrowserMocks(target)

      expect(target).toMatchObject({
        IntersectionObserver: expect.any(Function),
        ResizeObserver: expect.any(Function),
        localStorage: expect.any(MemoryStorage),
        matchMedia: expect.any(Function),
        sessionStorage: expect.any(MemoryStorage),
      })
    })

    it("defaults to installing onto globalThis when no target is given", () => {
      installBrowserMocks()

      expect(globalThis).toHaveProperty("ResizeObserver")
      expect(globalThis).toHaveProperty("IntersectionObserver")
      expect(globalThis).toHaveProperty("matchMedia")
      expect(globalThis).toHaveProperty("localStorage")
      expect(globalThis).toHaveProperty("sessionStorage")
    })

    it("wires up a functional ResizeObserver mock", () => {
      const target: Record<string, unknown> = {}

      installBrowserMocks(target)

      const ResizeObserverMock =
        target.ResizeObserver as new () => ResizeObserver
      const observer = new ResizeObserverMock()

      expect(observer.observe({} as Element)).toBeUndefined()
      expect(observer.unobserve({} as Element)).toBeUndefined()
      expect(observer.disconnect()).toBeUndefined()
    })

    it("wires up a functional IntersectionObserver mock with spec-shaped defaults", () => {
      const target: Record<string, unknown> = {}

      installBrowserMocks(target)

      const IntersectionObserverMock =
        target.IntersectionObserver as new () => IntersectionObserver
      const observer = new IntersectionObserverMock()

      expect(observer.root).toBeNull()
      expect(observer.rootMargin).toBe("0px")
      expect(observer.thresholds).toEqual([0])
      expect(observer.observe({} as Element)).toBeUndefined()
      expect(observer.unobserve({} as Element)).toBeUndefined()
      expect(observer.disconnect()).toBeUndefined()
      expect(observer.takeRecords()).toEqual([])
    })

    it("does not overwrite any pre-existing browser API", () => {
      const existingMatchMedia = (): never => {
        throw new Error("should not be called")
      }
      const existingResizeObserver = class {}
      const existingIntersectionObserver = class {}
      const existingSession = new MemoryStorage()

      const target = {
        IntersectionObserver: existingIntersectionObserver,
        ResizeObserver: existingResizeObserver,
        matchMedia: existingMatchMedia,
        sessionStorage: existingSession,
      }

      installBrowserMocks(target)

      expect(target.matchMedia).toBe(existingMatchMedia)
      expect(target.ResizeObserver).toBe(existingResizeObserver)
      expect(target.IntersectionObserver).toBe(existingIntersectionObserver)
      expect(target.sessionStorage).toBe(existingSession)
    })
  })
})
