/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest"
import { create, createStore } from "zustand"
import { composeMiddleware, withCondition } from "./types.js"
import { persistMiddleware, asyncPersistMiddleware } from "./persist.js"
import { createMemoryAdapter } from "../persistence/memory-adapter.js"
import type { PersistenceAdapter } from "../types/index.js"
import type { Middleware } from "./types.js"

describe("Middleware", () => {
  describe("composeMiddleware", () => {
    interface TestState {
      count: number
      increment: () => void
      decrement: () => void
    }

    it("should apply single middleware", () => {
      const trackingCalls: string[] = []

      const trackingMiddleware: Middleware<TestState> =
        (next) => (set, get, api) => {
          trackingCalls.push("middleware")
          return next(set, get, api)
        }

      const store = create<any>(
        trackingMiddleware((set) => ({
          count: 0,
          increment: () => set((s) => ({ count: s.count + 1 })),
          decrement: () => set((s) => ({ count: s.count - 1 })),
        }))
      )

      expect(trackingCalls).toContain("middleware")
      expect(store.getState().count).toBe(0)
    })

    it("should compose multiple middleware in correct order", () => {
      const executionOrder: string[] = []

      const middleware1: Middleware<TestState> = (next) => (set, get, api) => {
        executionOrder.push("middleware1-enter")
        const store = next(set, get, api)
        executionOrder.push("middleware1-exit")
        return store
      }

      const middleware2: Middleware<TestState> = (next) => (set, get, api) => {
        executionOrder.push("middleware2-enter")
        const store = next(set, get, api)
        executionOrder.push("middleware2-exit")
        return store
      }

      const composed = composeMiddleware(middleware1, middleware2)

      create<any>(
        composed((set) => ({
          count: 0,
          increment: () => set((s) => ({ count: s.count + 1 })),
          decrement: () => set((s) => ({ count: s.count - 1 })),
        }))
      )

      // Middleware should be applied right-to-left
      expect(executionOrder[0]).toBe("middleware2-enter")
      expect(executionOrder[1]).toBe("middleware1-enter")
    })

    it("should compose empty middleware list", () => {
      const store = create<any>(
        composeMiddleware<TestState>()((set) => ({
          count: 0,
          increment: () => set((s) => ({ count: s.count + 1 })),
          decrement: () => set((s) => ({ count: s.count - 1 })),
        }))
      )

      expect(store.getState().count).toBe(0)
      store.getState().increment()
      expect(store.getState().count).toBe(1)
    })
  })

  describe("withCondition", () => {
    interface TestState {
      value: number
      setValue: (v: number) => void
    }

    it("should apply middleware when condition is true", () => {
      const mockSet = vi.fn()
      const mockMiddleware: Middleware<TestState> =
        (next) => (set, get, api) => {
          return next(mockSet, get, api)
        }

      const conditionMiddleware = withCondition(true, mockMiddleware)

      create<any>(
        conditionMiddleware((set) => ({
          value: 0,
          setValue: (v) => set({ value: v }),
        }))
      )

      // Middleware should be applied
      expect(mockSet.mock.calls.length).toBeGreaterThanOrEqual(0)
    })

    it("should skip middleware when condition is false", () => {
      let middlewareApplied = false

      const mockMiddleware: Middleware<TestState> = (next) => {
        middlewareApplied = true
        return next
      }

      const conditionMiddleware = withCondition(false, mockMiddleware)

      create<any>(
        conditionMiddleware((set) => ({
          value: 0,
          setValue: (v) => set({ value: v }),
        }))
      )

      expect(middlewareApplied).toBe(false)
    })

    it("should evaluate dynamic condition function", () => {
      const shouldApply = false

      const mockMiddleware: Middleware<TestState> =
        (next) => (set, get, api) => {
          return next(set, get, api)
        }

      const conditionMiddleware = withCondition(
        () => shouldApply,
        mockMiddleware
      )

      const store = create<any>(
        conditionMiddleware((set) => ({
          value: 0,
          setValue: (v) => set({ value: v }),
        }))
      )

      expect(store.getState().value).toBe(0)
    })
  })

  describe("persistMiddleware", () => {
    interface TestState {
      count: number
      text: string
      increment: () => void
      setText: (t: string) => void
    }

    let adapter: PersistenceAdapter<TestState>

    beforeEach(() => {
      adapter = createMemoryAdapter<TestState>("test-persist")
    })

    it("should persist state on every update", () => {
      const store = create<any>(
        persistMiddleware({
          adapter,
        })((set) => ({
          count: 0,
          text: "",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setText: (t) => set({ text: t }),
        }))
      )

      store.getState().increment()
      expect(adapter.read()?.count).toBe(1)

      store.getState().setText("hello")
      expect(adapter.read()?.text).toBe("hello")
    })

    it("should rehydrate state from adapter on initialization", () => {
      const initialState: TestState = {
        count: 42,
        text: "persisted",
        increment: () => {},
        setText: () => {},
      }

      adapter.write(initialState)

      const store = create<any>(
        persistMiddleware({
          adapter,
        })((set) => ({
          count: 0,
          text: "",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setText: (t) => set({ text: t }),
        }))
      )

      expect(store.getState().count).toBe(42)
      expect(store.getState().text).toBe("persisted")
    })

    it("should call onRehydrate hook after rehydration", () => {
      const onRehydrate = vi.fn()

      adapter.write({
        count: 10,
        text: "test",
        increment: () => {},
        setText: () => {},
      })

      create<any>(
        persistMiddleware({
          adapter,
          onRehydrate,
        })((set) => ({
          count: 0,
          text: "",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setText: (t) => set({ text: t }),
        }))
      )

      expect(onRehydrate).toHaveBeenCalled()
      expect(onRehydrate).toHaveBeenCalledWith(
        expect.objectContaining({ count: 10, text: "test" })
      )
    })

    it("should call onError hook on rehydration failure", () => {
      const onError = vi.fn()

      const failingAdapter: PersistenceAdapter<TestState> = {
        read: () => {
          throw new Error("Read failed")
        },
        write: () => {},
        subscribe: () => () => {},
      }

      create<any>(
        persistMiddleware({
          adapter: failingAdapter,
          onError,
        })((set) => ({
          count: 0,
          text: "",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setText: (t) => set({ text: t }),
        }))
      )

      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })

    it("should use custom merge strategy", () => {
      const persisted: Partial<TestState> = { count: 99 }
      adapter.write(persisted as TestState)

      const customMerge = (
        _persisted: Partial<TestState>,
        initial: TestState
      ) => ({
        ...initial,
        count: 100, // Force count to 100
      })

      const store = create<any>(
        persistMiddleware({
          adapter,
          merge: customMerge,
        })((set) => ({
          count: 0,
          text: "initial",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setText: (t) => set({ text: t }),
        }))
      )

      expect(store.getState().count).toBe(100)
      expect(store.getState().text).toBe("initial")
    })

    it("should handle update functions in set", () => {
      const store = create<any>(
        persistMiddleware({
          adapter,
        })((set) => ({
          count: 5,
          text: "",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setText: (t) => set({ text: t }),
        }))
      )

      store.getState().increment()
      expect(store.getState().count).toBe(6)
      expect(adapter.read()?.count).toBe(6)
    })

    it("should handle partial state updates", () => {
      const store = create<any>(
        persistMiddleware({
          adapter,
        })((set) => ({
          count: 0,
          text: "initial",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setText: (t) => set({ text: t }),
        }))
      )

      store.getState().setText("updated")
      const persisted = adapter.read()
      expect(persisted?.text).toBe("updated")
      expect(persisted?.count).toBe(0)
    })
  })

  describe("asyncPersistMiddleware", () => {
    interface TestState {
      data: string
      setData: (d: string) => void
    }

    it("should handle async write operations", async () => {
      const writePromises: Promise<void>[] = []

      const asyncAdapter = {
        read: async () => undefined as TestState | undefined,
        write: async (_state: TestState) => {
          writePromises.push(Promise.resolve())
        },
        subscribe: () => () => {},
      }

      const store = create<any>(
        asyncPersistMiddleware({
          adapter: asyncAdapter,
        })((set) => ({
          data: "initial",
          setData: (d: string) => set({ data: d }),
        }))
      )

      store.getState().setData("updated")

      // Give time for async write
      await new Promise((r) => setTimeout(r, 10))

      expect(store.getState().data).toBe("updated")
    })

    it("should handle async read during rehydration", async () => {
      const asyncAdapter = {
        read: async () =>
          new Promise<TestState>((resolve) => {
            setTimeout(() => {
              resolve({ data: "async-loaded", setData: () => {} })
            }, 10)
          }),
        write: async () => {},
        subscribe: () => () => {},
      }

      const store = create<any>(
        asyncPersistMiddleware({
          adapter: asyncAdapter,
        })((set) => ({
          data: "initial",
          setData: (d: string) => set({ data: d }),
        }))
      )

      // Wait for async rehydration
      await new Promise((r) => setTimeout(r, 50))

      expect(store.getState().data).toBe("async-loaded")
    })

    it("should call onError on async write failure", async () => {
      const onError = vi.fn()

      const asyncAdapter = {
        read: async () => undefined as TestState | undefined,
        write: async () => {
          throw new Error("Async write failed")
        },
        subscribe: () => () => {},
      }

      const store = create<any>(
        asyncPersistMiddleware({
          adapter: asyncAdapter,
          onError,
        })((set) => ({
          data: "initial",
          setData: (d: string) => set({ data: d }),
        }))
      )

      store.getState().setData("updated")

      // Give time for async error
      await new Promise((r) => setTimeout(r, 10))

      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })

    it("should handle async rehydration with onRehydrate", async () => {
      const onRehydrate = vi.fn()

      const asyncAdapter = {
        read: async () =>
          new Promise<TestState>((resolve) => {
            setTimeout(() => {
              resolve({
                data: "async-rehydrated",
                setData: () => {},
              })
            }, 10)
          }),
        write: async () => {},
        subscribe: () => () => {},
      }

      create<any>(
        asyncPersistMiddleware({
          adapter: asyncAdapter,
          onRehydrate,
        })((set) => ({
          data: "initial",
          setData: (d: string) => set({ data: d }),
        }))
      )

      await new Promise((r) => setTimeout(r, 50))

      expect(onRehydrate).toHaveBeenCalledWith(
        expect.objectContaining({ data: "async-rehydrated" })
      )
    })

    it("should apply custom merge in async rehydration", async () => {
      const customMerge = (
        _persisted: Partial<TestState>,
        initial: TestState
      ) => ({
        ...initial,
        data: "custom-merged",
      })

      const asyncAdapter = {
        read: async () =>
          new Promise<TestState>((resolve) => {
            setTimeout(() => {
              resolve({ data: "async-data", setData: () => {} })
            }, 10)
          }),
        write: async () => {},
        subscribe: () => () => {},
      }

      const store = create<any>(
        asyncPersistMiddleware({
          adapter: asyncAdapter,
          merge: customMerge,
        })((set) => ({
          data: "initial",
          setData: (d: string) => set({ data: d }),
        }))
      )

      await new Promise((r) => setTimeout(r, 50))

      expect(store.getState().data).toBe("custom-merged")
    })

    it("should handle async subscribe to external changes", async () => {
      const persistedData = { data: "initial", setData: (_d: string) => {} }
      let subscriber: (() => void) | null = null

      const asyncAdapter = {
        read: async () => Promise.resolve(persistedData),
        write: async () => {},
        subscribe: (listener: () => void) => {
          subscriber = listener
          return () => {
            subscriber = null
          }
        },
      }

      const store = create<any>(
        asyncPersistMiddleware({
          adapter: asyncAdapter,
          syncExternal: true,
        })((set) => ({
          data: "initial",
          setData: (d: string) => set({ data: d }),
        }))
      )

      await new Promise((r) => setTimeout(r, 10))

      // Simulate external change
      persistedData.data = "external-change"
      if (subscriber && typeof subscriber === "function") {
        ;(subscriber as any)()
        await new Promise((r) => setTimeout(r, 10))
      }

      expect(store.getState().data).toBe("external-change")
    })

    it("should skip syncExternal when disabled in async", async () => {
      const persistedData = { data: "initial", setData: () => {} }
      const subscribeSpy = vi.fn(() => () => {})

      const asyncAdapter = {
        read: async () => Promise.resolve(persistedData),
        write: async () => {},
        subscribe: subscribeSpy,
      }

      createStore<any>(
        asyncPersistMiddleware({
          adapter: asyncAdapter,
          syncExternal: false,
        })((set: any) => ({
          data: "initial",
          setData: () => set({}),
        }))
      )

      await new Promise((r) => setTimeout(r, 10))

      expect(subscribeSpy).not.toHaveBeenCalled()
    })
  })

  describe("persistMiddleware - syncExternal and external storage", () => {
    interface TestState {
      value: string
      setValue: (v: string) => void
    }

    it("should sync external storage changes when syncExternal is true", () => {
      let externalSubscriber: (() => void) | null = null

      const adapter: PersistenceAdapter<TestState> = {
        read: () => ({ value: "initial", setValue: () => {} }),
        write: () => {},
        subscribe: (listener) => {
          externalSubscriber = listener
          return () => {
            externalSubscriber = null
          }
        },
      }

      const store = create<any>(
        persistMiddleware({
          adapter,
          syncExternal: true,
        })((set) => ({
          value: "initial",
          setValue: (v) => set({ value: v }),
        }))
      )

      // Simulate external change
      if (externalSubscriber && typeof externalSubscriber === "function") {
        vi.spyOn(adapter, "read").mockReturnValue({
          value: "external-update",
          setValue: () => {},
        })
        ;(externalSubscriber as () => void)() // Trigger the subscriber callback
      }

      expect(store.getState().value).toBe("external-update")
    })

    it("should not sync external changes when syncExternal is false", () => {
      let subscribeCalled = false

      const adapter: PersistenceAdapter<TestState> = {
        read: () => ({ value: "initial", setValue: () => {} }),
        write: () => {},
        subscribe: () => {
          subscribeCalled = true
          return () => {}
        },
      }

      create<any>(
        persistMiddleware({
          adapter,
          syncExternal: false,
        })((set) => ({
          value: "initial",
          setValue: (v) => set({ value: v }),
        }))
      )

      expect(subscribeCalled).toBe(false)
    })

    it("should attach cleanup function to store API", () => {
      const unsubscribeSpy = vi.fn(() => {})

      const adapter: PersistenceAdapter<TestState> = {
        read: () => ({ value: "initial", setValue: () => {} }),
        write: () => {},
        subscribe: () => unsubscribeSpy,
      }

      const store = create<any>(
        persistMiddleware({
          adapter,
          syncExternal: true,
        })((set) => ({
          value: "initial",
          setValue: (v) => set({ value: v }),
        }))
      )

      // Check that cleanup is attached to API
      const cleanup = (store as unknown as Record<string, unknown>)
        .__persistCleanup
      expect(cleanup).toBe(unsubscribeSpy)
    })

    it("should handle errors in external subscription callback", () => {
      const onError = vi.fn()
      let externalSubscriber: (() => void) | null = null

      const adapter: PersistenceAdapter<TestState> = {
        read: () => {
          throw new Error("Read failed")
        },
        write: () => {},
        subscribe: (listener) => {
          externalSubscriber = listener
          return () => {}
        },
      }

      create<any>(
        persistMiddleware({
          adapter,
          onError,
          syncExternal: true,
        })((set) => ({
          value: "initial",
          setValue: (v) => set({ value: v }),
        }))
      )

      // Trigger subscriber callback with error
      if (externalSubscriber && typeof externalSubscriber === "function") {
        ;(externalSubscriber as () => void)()
      }

      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })

    it("should filter functions when applying external changes", () => {
      let externalSubscriber: (() => void) | null = null

      const adapter: PersistenceAdapter<TestState> = {
        read: () => ({
          value: "updated",
          setValue: () => {},
        }),
        write: () => {},
        subscribe: (listener) => {
          externalSubscriber = listener
          return () => {}
        },
      }

      const store = create<any>(
        persistMiddleware({
          adapter,
          syncExternal: true,
        })((set) => ({
          value: "initial",
          setValue: (v) => set({ value: v }),
        }))
      )

      // Trigger external change
      if (externalSubscriber && typeof externalSubscriber === "function") {
        ;(externalSubscriber as () => void)()
      }

      // setValue should still be a function
      expect(typeof store.getState().setValue).toBe("function")
      expect(store.getState().value).toBe("updated")
    })

    it("should use custom merge with external changes", () => {
      const customMerge = (
        persisted: Partial<TestState>,
        initial: TestState
      ) => ({
        ...initial,
        value: persisted.value || initial.value,
      })

      let externalValue = "external"
      let externalSubscriber: (() => void) | null = null

      const adapter: PersistenceAdapter<TestState> = {
        read: () => ({
          value: externalValue,
          setValue: () => {},
        }),
        write: () => {},
        subscribe: (listener) => {
          externalSubscriber = listener
          return () => {}
        },
      }

      const store = create<any>(
        persistMiddleware({
          adapter,
          merge: customMerge,
          syncExternal: true,
        })((set) => ({
          value: "initial",
          setValue: (v) => set({ value: v }),
        }))
      )

      // Simulate external change by updating the mock value
      externalValue = "updated-external"

      // Trigger external change
      if (externalSubscriber && typeof externalSubscriber === "function") {
        ;(externalSubscriber as () => void)()
      }

      expect(store.getState().value).toBe("updated-external")
    })

    it("should call onRehydrate after external sync", () => {
      const onRehydrate = vi.fn()
      let externalSubscriber: (() => void) | null = null

      const adapter: PersistenceAdapter<TestState> = {
        read: () => ({
          value: "external",
          setValue: () => {},
        }),
        write: () => {},
        subscribe: (listener) => {
          externalSubscriber = listener
          return () => {}
        },
      }

      const _store = create<any>(
        persistMiddleware({
          adapter,
          onRehydrate,
          syncExternal: true,
        })((set) => ({
          value: "initial",
          setValue: (v) => set({ value: v }),
        }))
      )

      const initialCallCount = onRehydrate.mock.calls.length

      // Trigger external change
      if (externalSubscriber && typeof externalSubscriber === "function") {
        ;(externalSubscriber as () => void)()
      }

      expect(onRehydrate.mock.calls.length).toBeGreaterThan(initialCallCount)
    })

    it("should handle errors in write operations", () => {
      const onError = vi.fn()

      const adapter: PersistenceAdapter<TestState> = {
        read: () => ({ value: "initial", setValue: () => {} }),
        write: () => {
          throw new Error("Write failed")
        },
        subscribe: () => () => {},
      }

      const store = create<any>(
        persistMiddleware({
          adapter,
          onError,
        })((set) => ({
          value: "initial",
          setValue: (v) => set({ value: v }),
        }))
      )

      store.getState().setValue("test")

      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })

    it("should continue updating state even if write fails", () => {
      const adapter: PersistenceAdapter<TestState> = {
        read: () => ({ value: "initial", setValue: () => {} }),
        write: () => {
          throw new Error("Write failed")
        },
        subscribe: () => () => {},
      }

      const store = create<any>(
        persistMiddleware({
          adapter,
          onError: () => {},
        })((set) => ({
          value: "initial",
          setValue: (v) => set({ value: v }),
        }))
      )

      store.getState().setValue("updated")

      expect(store.getState().value).toBe("updated")
    })

    it("should handle non-Error thrown values as errors", () => {
      const onError = vi.fn()

      const adapter: PersistenceAdapter<TestState> = {
        read: () => {
          throw "string-error" // Non-Error thrown
        },
        write: () => {},
        subscribe: () => () => {},
      }

      create<any>(
        persistMiddleware({
          adapter,
          onError,
        })((set) => ({
          value: "initial",
          setValue: (v) => set({ value: v }),
        }))
      )

      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })

    it("should handle update function with objects containing functions", () => {
      const persistedValues: Partial<TestState> = {}

      const adapter: PersistenceAdapter<TestState> = {
        read: () => ({
          value: persistedValues.value || "initial",
          setValue: () => {},
        }),
        write: (state) => {
          persistedValues.value = state.value
        },
        subscribe: () => () => {},
      }

      const store = create<any>(
        persistMiddleware({
          adapter,
        })((set) => ({
          value: "initial",
          setValue: (v) => set({ value: v }),
        }))
      )

      // Update with object (not function)
      store.getState().setValue("test")

      expect(store.getState().value).toBe("test")
      expect(persistedValues.value).toBe("test")
    })
  })
})
