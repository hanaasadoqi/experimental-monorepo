import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { create } from "zustand"
import { loggerMiddleware, devLoggerMiddleware } from "./logger.js"
import type { Middleware } from "./types.js"

describe("Logger Middleware", () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>
    groupCollapsed: ReturnType<typeof vi.spyOn>
    groupEnd: ReturnType<typeof vi.spyOn>
  }

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      groupCollapsed: vi
        .spyOn(console, "groupCollapsed")
        .mockImplementation(() => {}),
      groupEnd: vi.spyOn(console, "groupEnd").mockImplementation(() => {}),
    }
  })

  afterEach(() => {
    consoleSpy.log.mockRestore()
    consoleSpy.groupCollapsed.mockRestore()
    consoleSpy.groupEnd.mockRestore()
  })

  describe("loggerMiddleware", () => {
    interface TestState {
      count: number
      name: string
      increment: () => void
      setName: (n: string) => void
    }

    it("should log state updates with default options", () => {
      const store = create<TestState>(
        loggerMiddleware()((set) => ({
          count: 0,
          name: "",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setName: (n) => set({ name: n }),
        }))
      )

      store.getState().increment()

      expect(consoleSpy.groupCollapsed).toHaveBeenCalledWith(
        expect.stringContaining("Store")
      )
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "Previous State:",
        expect.any(Object)
      )
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "New State:",
        expect.any(Object)
      )
      expect(consoleSpy.groupEnd).toHaveBeenCalled()
    })

    it("should use custom prefix", () => {
      const store = create<TestState>(
        loggerMiddleware({ prefix: "MyStore" })((set) => ({
          count: 0,
          name: "",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setName: (n) => set({ name: n }),
        }))
      )

      store.getState().increment()

      expect(consoleSpy.groupCollapsed).toHaveBeenCalledWith(
        expect.stringContaining("MyStore")
      )
    })

    it("should log diff when logDiff is enabled", () => {
      const store = create<TestState>(
        loggerMiddleware({ logDiff: true })((set) => ({
          count: 0,
          name: "initial",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setName: (n) => set({ name: n }),
        }))
      )

      store.getState().setName("updated")

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "Changes:",
        expect.objectContaining({
          name: expect.objectContaining({
            old: "initial",
            new: "updated",
          }),
        })
      )
    })

    it("should log 'No changes' when logDiff is enabled but no changes occur", () => {
      const store = create<TestState>(
        loggerMiddleware({ logDiff: true })((set) => ({
          count: 0,
          name: "",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setName: (n) => set({ name: n }),
        }))
      )

      // Set to same value
      store.getState().setName("")

      expect(consoleSpy.log).toHaveBeenCalledWith("No changes")
    })

    it("should handle multiple changes in diff", () => {
      const store = create<TestState>(
        loggerMiddleware({ logDiff: true })((set) => ({
          count: 0,
          name: "",
          increment: () =>
            set((s) => ({ count: s.count + 1, name: "updated" })),
          setName: (n) => set({ name: n }),
        }))
      )

      store.getState().increment()

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "Changes:",
        expect.objectContaining({
          count: expect.any(Object),
          name: expect.any(Object),
        })
      )
    })

    it("should skip logging when logState is false", () => {
      const store = create<TestState>(
        loggerMiddleware({ logState: false })((set) => ({
          count: 0,
          name: "",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setName: (n) => set({ name: n }),
        }))
      )

      store.getState().increment()

      // Should still call groupCollapsed but not log state details
      expect(consoleSpy.groupCollapsed).toHaveBeenCalled()
      expect(
        consoleSpy.log.mock.calls.some((call) =>
          call[0]?.toString().includes("Previous State")
        )
      ).toBe(false)
    })

    it("should use console.log instead of groupCollapsed when useGrouping is false", () => {
      const store = create<TestState>(
        loggerMiddleware({ useGrouping: false })((set) => ({
          count: 0,
          name: "",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setName: (n) => set({ name: n }),
        }))
      )

      store.getState().increment()

      expect(consoleSpy.groupCollapsed).not.toHaveBeenCalled()
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("Store")
      )
      expect(consoleSpy.groupEnd).not.toHaveBeenCalled()
    })

    it("should exclude updates when filter returns false", () => {
      const filter = vi.fn((update: unknown) => {
        // Filter out updates where update.name is 'filtered'
        return !(
          typeof update === "object" &&
          update !== null &&
          "name" in update &&
          update.name === "filtered"
        )
      })

      const store = create<TestState>(
        loggerMiddleware({ filter })((set) => ({
          count: 0,
          name: "",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setName: (n) => set({ name: n }),
        }))
      )

      const initialCallCount = consoleSpy.groupCollapsed.mock.calls.length

      // This should be filtered and not logged
      store.getState().setName("filtered")

      expect(filter).toHaveBeenCalled()
      expect(store.getState().name).toBe("filtered") // State updated
      expect(consoleSpy.groupCollapsed.mock.calls.length).toBe(initialCallCount) // But not logged
    })

    it("should allow updates through when filter returns true", () => {
      const filter = vi.fn(() => true)

      const store = create<TestState>(
        loggerMiddleware({ filter })((set) => ({
          count: 0,
          name: "",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setName: (n) => set({ name: n }),
        }))
      )

      const initialCallCount = consoleSpy.groupCollapsed.mock.calls.length

      store.getState().setName("allowed")

      expect(filter).toHaveBeenCalled()
      expect(store.getState().name).toBe("allowed")
      expect(consoleSpy.groupCollapsed.mock.calls.length).toBeGreaterThan(
        initialCallCount
      )
    })

    it("should log function updates as [function]", () => {
      const store = create<TestState>(
        loggerMiddleware()((set) => ({
          count: 0,
          name: "",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setName: (n) => set({ name: n }),
        }))
      )

      store.getState().increment()

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "Update:",
        expect.stringContaining("function")
      )
    })

    it("should distinguish between function and object updates in log type", () => {
      const store = create<TestState>(
        loggerMiddleware({ useGrouping: false })((set) => ({
          count: 0,
          name: "",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setName: (n) => set({ name: n }),
        }))
      )

      const callsBefore = consoleSpy.log.mock.calls.length

      // Function update
      store.getState().increment()

      const callsAfterFunction = consoleSpy.log.mock.calls.length
      expect(callsAfterFunction).toBeGreaterThan(callsBefore)

      const functionUpdateCall = consoleSpy.log.mock.calls.find((call) =>
        call[0]?.toString().includes("(function)")
      )
      expect(functionUpdateCall).toBeDefined()

      // Object update
      store.getState().setName("test")

      const objectUpdateCall = consoleSpy.log.mock.calls
        .slice(callsAfterFunction)
        .find((call) => call[0]?.toString().includes("(object)"))
      expect(objectUpdateCall).toBeDefined()
    })

    it("should handle combined options correctly", () => {
      const store = create<TestState>(
        loggerMiddleware({
          prefix: "App",
          logState: true,
          logDiff: true,
          useGrouping: true,
        })((set) => ({
          count: 0,
          name: "test",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setName: (n) => set({ name: n }),
        }))
      )

      store.getState().increment()

      expect(consoleSpy.groupCollapsed).toHaveBeenCalledWith(
        expect.stringContaining("App")
      )
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "Previous State:",
        expect.any(Object)
      )
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "Changes:",
        expect.any(Object)
      )
      expect(consoleSpy.groupEnd).toHaveBeenCalled()
    })
  })

  describe("devLoggerMiddleware", () => {
    const originalEnv = process.env.NODE_ENV

    afterEach(() => {
      process.env.NODE_ENV = originalEnv
    })

    it("should apply logger in development environment", () => {
      process.env.NODE_ENV = "development"

      interface TestState {
        value: number
        setValue: (v: number) => void
      }

      const store = create<TestState>(
        devLoggerMiddleware()((set) => ({
          value: 0,
          setValue: (v) => set({ value: v }),
        }))
      )

      store.getState().setValue(42)

      expect(consoleSpy.groupCollapsed).toHaveBeenCalled()
    })

    it("should skip logger in production environment", () => {
      process.env.NODE_ENV = "production"

      interface TestState {
        value: number
        setValue: (v: number) => void
      }

      const store = create<TestState>(
        devLoggerMiddleware()((set) => ({
          value: 0,
          setValue: (v) => set({ value: v }),
        }))
      )

      store.getState().setValue(42)

      expect(consoleSpy.groupCollapsed).not.toHaveBeenCalled()
    })

    it("should accept options in development environment", () => {
      process.env.NODE_ENV = "development"

      interface TestState {
        value: number
        setValue: (v: number) => void
      }

      const store = create<TestState>(
        devLoggerMiddleware({ prefix: "DevStore", logState: false })((set) => ({
          value: 0,
          setValue: (v) => set({ value: v }),
        }))
      )

      store.getState().setValue(42)

      expect(consoleSpy.groupCollapsed).toHaveBeenCalledWith(
        expect.stringContaining("DevStore")
      )
    })
  })
})
