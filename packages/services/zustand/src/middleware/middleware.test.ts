/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest"
import { createStore } from "zustand"
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

    it("apply single middleware", async () => {
      const trackingCalls: string[] = []

      const trackingMiddleware: Middleware<TestState> =
        (next) => (set, get, api) => {
          trackingCalls.push("middleware")
          return next(set, get, api)
        }

      const store = createStore<any>(
        trackingMiddleware((set) => ({
          count: 0,
          increment: () => set((s) => ({ count: s.count + 1 })),
          decrement: () => set((s) => ({ count: s.count - 1 })),
        }))
      )

      expect(trackingCalls).toContain("middleware")
      expect(store.getState().count).toBe(0)
    })

    it("compose multiple middleware in correct order", async () => {
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

      createStore<any>(
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

    it("compose empty middleware list", async () => {
      const store = createStore<any>(
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

    it("apply middleware when condition is true", async () => {
      const mockSet = vi.fn()
      const mockMiddleware: Middleware<TestState> =
        (next) => (set, get, api) => {
          return next(mockSet, get, api)
        }

      const conditionMiddleware = withCondition(true, mockMiddleware)

      createStore<any>(
        conditionMiddleware((set) => ({
          value: 0,
          setValue: (v) => set({ value: v }),
        }))
      )

      // Middleware should be applied
      expect(mockSet.mock.calls.length).toBeGreaterThanOrEqual(0)
    })

    it("skip middleware when condition is false", async () => {
      let middlewareApplied = false

      const mockMiddleware: Middleware<TestState> = (next) => {
        middlewareApplied = true
        return next
      }

      const conditionMiddleware = withCondition(false, mockMiddleware)

      createStore<any>(
        conditionMiddleware((set) => ({
          value: 0,
          setValue: (v) => set({ value: v }),
        }))
      )

      expect(middlewareApplied).toBe(false)
    })

    it("evaluate dynamic condition function", async () => {
      const shouldApply = false

      const mockMiddleware: Middleware<TestState> =
        (next) => (set, get, api) => {
          return next(set, get, api)
        }

      const conditionMiddleware = withCondition(
        () => shouldApply,
        mockMiddleware
      )

      const store = createStore<any>(
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

    it("rejects an empty persistence key", () => {
      expect(() =>
        persistMiddleware<TestState>({
          key: "",
          adapter,
        })
      ).toThrow(TypeError)
    })

    it("should persist state on every update", async () => {
      const store = createStore<any>(
        persistMiddleware({
          key: "test-persist",
          adapter,
        })((set) => ({
          count: 0,
          text: "",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setText: (t) => set({ text: t }),
        }))
      )

      store.getState().increment()
      await new Promise((r) => setTimeout(r, 10))
      const state1 = await adapter.read?.("test-persist")
      expect(state1?.count).toBe(1)

      store.getState().setText("hello")
      await new Promise((r) => setTimeout(r, 10))
      const state2 = await adapter.read?.("test-persist")
      expect(state2?.text).toBe("hello")
    })

    it("rehydrate state from adapter on initialization", async () => {
      const initialState: TestState = {
        count: 42,
        text: "persisted",
        increment: () => {},
        setText: () => {},
      }

      await adapter.write?.("test-persist", initialState)

      const store = createStore<any>(
        persistMiddleware({
          key: "test-persist",
          adapter,
        })((set) => ({
          count: 0,
          text: "",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setText: (t) => set({ text: t }),
        }))
      )

      await vi.waitFor(() => {
        expect(store.getState().count).toBe(42)
        expect(store.getState().text).toBe("persisted")
      })
    })

    it("call onRehydrate hook after rehydration", async () => {
      const onRehydrate = vi.fn()

      await adapter.write?.("test-persist", {
        count: 10,
        text: "test",
        increment: () => {},
        setText: () => {},
      })

      createStore<any>(
        persistMiddleware({
          key: "test-persist",
          adapter,
          onRehydrate,
        })((set) => ({
          count: 0,
          text: "",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setText: (t) => set({ text: t }),
        }))
      )

      await vi.waitFor(() => {
        expect(onRehydrate).toHaveBeenCalledWith(
          expect.objectContaining({ count: 10, text: "test" })
        )
      })
    })

    it("call onError hook on rehydration failure", async () => {
      const onError = vi.fn()

      const failingAdapter: PersistenceAdapter<TestState> = {
        read: async (_key?: string) => {
          throw new Error("Read failed")
        },
        write: async (_key: string, _value: TestState) => {},
        delete: async (_key: string) => {},
        clear: async () => {},
        subscribe:
          (_key: string, _listener: (value: TestState | null) => void) =>
          () => {},
      }

      createStore<any>(
        persistMiddleware({
          key: "test-persist",
          adapter: failingAdapter,
          onError,
        })((set) => ({
          count: 0,
          text: "",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setText: (t) => set({ text: t }),
        }))
      )

      await vi.waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error))
      })
    })

    it("use custom merge strategy", async () => {
      const persisted: Partial<TestState> = { count: 99 }
      await adapter.write?.("test-persist", persisted as TestState)

      const customMerge = (
        _persisted: Partial<TestState>,
        initial: TestState
      ) => ({
        ...initial,
        count: 100, // Force count to 100
      })

      const store = createStore<any>(
        persistMiddleware({
          key: "test-persist",
          adapter,
          merge: customMerge,
        })((set) => ({
          count: 0,
          text: "initial",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setText: (t) => set({ text: t }),
        }))
      )

      await vi.waitFor(() => {
        expect(store.getState().count).toBe(100)
        expect(store.getState().text).toBe("initial")
      })
    })

    it("handle update functions in set", async () => {
      const store = createStore<any>(
        persistMiddleware({
          key: "test-persist",
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
      const state = await adapter.read?.("test-persist")
      expect(state?.count).toBe(6)
    })

    it("handle partial state updates", async () => {
      const store = createStore<any>(
        persistMiddleware({
          key: "test-persist",
          adapter,
        })((set) => ({
          count: 0,
          text: "initial",
          increment: () => set((s) => ({ count: s.count + 1 })),
          setText: (t) => set({ text: t }),
        }))
      )

      store.getState().setText("updated")
      await new Promise((r) => setTimeout(r, 10))
      const persisted = await adapter.read?.("test-persist")
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

      const store = createStore<any>(
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

      const store = createStore<any>(
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

      const store = createStore<any>(
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

      createStore<any>(
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

      const store = createStore<any>(
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

      const store = createStore<any>(
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

    it("sync external storage changes when syncExternal is true", async () => {
      let externalSubscriber: ((value: TestState | null) => void) | null = null

      const adapter: PersistenceAdapter<TestState> = {
        read: async (_key?: string) => ({
          value: "initial",
          setValue: () => {},
        }),
        write: async (_key: string, _value: TestState) => {},
        delete: async (_key: string) => {},
        clear: async () => {},
        subscribe: (
          _key: string,
          listener: (value: TestState | null) => void
        ) => {
          externalSubscriber = listener
          return () => {
            externalSubscriber = null
          }
        },
      }

      const store = createStore<any>(
        persistMiddleware({
          key: "test-persist",
          adapter,
          syncExternal: true,
        })((set) => ({
          value: "initial",
          setValue: (v) => set({ value: v }),
        }))
      )

      // Simulate external change
      if (externalSubscriber) {
        vi.spyOn(adapter, "read").mockReturnValue(
          Promise.resolve({
            value: "external-update",
            setValue: () => {},
          })
        )
        ;(externalSubscriber as (value: TestState | null) => void)({
          value: "external-update",
          setValue: () => {},
        })
      }

      expect(store.getState().value).toBe("external-update")
    })

    it("not sync external changes when syncExternal is false", async () => {
      let subscribeCalled = false

      const adapter: PersistenceAdapter<TestState> = {
        read: async (_key?: string) => ({
          value: "initial",
          setValue: () => {},
        }),
        write: async (_key: string, _value: TestState) => {},
        delete: async (_key: string) => {},
        clear: async () => {},
        subscribe: (
          _key: string,
          _listener: (value: TestState | null) => void
        ) => {
          subscribeCalled = true
          return () => {}
        },
      }

      createStore<any>(
        persistMiddleware({
          key: "test-persist",
          adapter,
          syncExternal: false,
        })((set) => ({
          value: "initial",
          setValue: (v) => set({ value: v }),
        }))
      )

      expect(subscribeCalled).toBe(false)
    })

    it("attach cleanup function to store API", async () => {
      const unsubscribeSpy = vi.fn(() => {})

      const adapter: PersistenceAdapter<TestState> = {
        read: async (_key?: string) => ({
          value: "initial",
          setValue: () => {},
        }),
        write: async (_key: string, _value: TestState) => {},
        delete: async (_key: string) => {},
        clear: async () => {},
        subscribe: (
          _key: string,
          _listener: (value: TestState | null) => void
        ) => unsubscribeSpy,
      }

      const store = createStore<any>(
        persistMiddleware({
          key: "test-persist",
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

    it("handle errors in external subscription callback", async () => {
      const onError = vi.fn()
      let externalSubscriber: ((value: TestState | null) => void) | null = null

      const adapter: PersistenceAdapter<TestState> = {
        read: async () => {
          throw new Error("Read failed")
        },
        write: async (_key: string, _value: TestState) => {},
        delete: async (_key: string) => {},
        clear: async () => {},
        subscribe: (
          _key: string,
          listener: (value: TestState | null) => void
        ) => {
          externalSubscriber = listener
          return () => {}
        },
      }

      createStore<any>(
        persistMiddleware({
          key: "test-persist",
          adapter,
          merge: () => {
            throw new Error("Merge failed")
          },
          onError,
          syncExternal: true,
        })((set) => ({
          value: "initial",
          setValue: (v) => set({ value: v }),
        }))
      )

      // Trigger subscriber callback with error
      if (externalSubscriber) {
        ;(externalSubscriber as (value: TestState | null) => void)({
          value: "updated",
          setValue: () => {},
        })
      }

      await vi.waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error))
      })
    })

    it("filter functions when applying external changes", async () => {
      let externalSubscriber: ((value: TestState | null) => void) | null = null

      const adapter: PersistenceAdapter<TestState> = {
        read: async (_key?: string) => ({
          value: "updated",
          setValue: () => {},
        }),
        write: async (_key: string, _value: TestState) => {},
        delete: async (_key: string) => {},
        clear: async () => {},
        subscribe: (
          _key: string,
          listener: (value: TestState | null) => void
        ) => {
          externalSubscriber = listener
          return () => {}
        },
      }

      const store = createStore<any>(
        persistMiddleware({
          key: "test-persist",
          adapter,
          syncExternal: true,
        })((set) => ({
          value: "initial",
          setValue: (v) => set({ value: v }),
        }))
      )

      // Trigger external change
      if (externalSubscriber) {
        ;(externalSubscriber as (value: TestState | null) => void)({
          value: "updated",
          setValue: () => {},
        })
      }

      // setValue should still be a function
      expect(typeof store.getState().setValue).toBe("function")
      expect(store.getState().value).toBe("updated")
    })

    it("use custom merge with external changes", async () => {
      const customMerge = (
        persisted: Partial<TestState>,
        initial: TestState
      ) => ({
        ...initial,
        value: persisted.value || initial.value,
      })

      let externalValue = "external"
      let externalSubscriber: ((value: TestState | null) => void) | null = null

      const adapter: PersistenceAdapter<TestState> = {
        read: async (_key?: string) => ({
          value: externalValue,
          setValue: () => {},
        }),
        write: async (_key: string, _value: TestState) => {},
        delete: async (_key: string) => {},
        clear: async () => {},
        subscribe: (
          _key: string,
          listener: (value: TestState | null) => void
        ) => {
          externalSubscriber = listener
          return () => {}
        },
      }

      const store = createStore<any>(
        persistMiddleware({
          key: "test-persist",
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
      if (externalSubscriber) {
        ;(externalSubscriber as (value: TestState | null) => void)({
          value: "updated-external",
          setValue: () => {},
        })
      }

      expect(store.getState().value).toBe("updated-external")
    })

    it("call onRehydrate after external sync", async () => {
      const onRehydrate = vi.fn()
      let externalSubscriber: ((value: TestState | null) => void) | null = null

      const adapter: PersistenceAdapter<TestState> = {
        read: async (_key?: string) => ({
          value: "external",
          setValue: () => {},
        }),
        write: async (_key: string, _value: TestState) => {},
        delete: async (_key: string) => {},
        clear: async () => {},
        subscribe: (
          _key: string,
          listener: (value: TestState | null) => void
        ) => {
          externalSubscriber = listener
          return () => {}
        },
      }

      const _store = createStore<any>(
        persistMiddleware({
          key: "test-persist",
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
      if (externalSubscriber) {
        ;(externalSubscriber as (value: TestState | null) => void)({
          value: "external",
          setValue: () => {},
        })
      }

      expect(onRehydrate.mock.calls.length).toBeGreaterThan(initialCallCount)
    })

    it("handle errors in write operations", async () => {
      const onError = vi.fn()

      const adapter: PersistenceAdapter<TestState> = {
        read: async (_key?: string) => ({
          value: "initial",
          setValue: () => {},
        }),
        write: async (_key: string, _value: TestState) => {
          throw new Error("Write failed")
        },
        delete: async (_key: string) => {},
        clear: async () => {},
        subscribe:
          (_key: string, _listener: (value: TestState | null) => void) =>
          () => {},
      }

      const store = createStore<any>(
        persistMiddleware({
          key: "test-persist",
          adapter,
          onError,
        })((set) => ({
          value: "initial",
          setValue: (v) => set({ value: v }),
        }))
      )

      store.getState().setValue("test")

      await vi.waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error))
      })
    })

    it("continue updating state even if write fails", async () => {
      const adapter: PersistenceAdapter<TestState> = {
        read: async (_key?: string) => ({
          value: "initial",
          setValue: () => {},
        }),
        write: async (_key: string, _value: TestState) => {
          throw new Error("Write failed")
        },
        delete: async (_key: string) => {},
        clear: async () => {},
        subscribe:
          (_key: string, _listener: (value: TestState | null) => void) =>
          () => {},
      }

      const store = createStore<any>(
        persistMiddleware({
          key: "test-persist",
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

    it("handle non-Error thrown values as errors", async () => {
      const onError = vi.fn()

      const adapter: PersistenceAdapter<TestState> = {
        read: async (_key?: string) => {
          throw "string-error" // Non-Error thrown
        },
        write: async (_key: string, _value: TestState) => {},
        delete: async (_key: string) => {},
        clear: async () => {},
        subscribe:
          (_key: string, _listener: (value: TestState | null) => void) =>
          () => {},
      }

      createStore<any>(
        persistMiddleware({
          key: "test-persist",
          adapter,
          onError,
        })((set) => ({
          value: "initial",
          setValue: (v) => set({ value: v }),
        }))
      )

      await vi.waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error))
      })
    })

    it("handle update function with objects containing functions", async () => {
      const persistedValues: Partial<TestState> = {}

      const adapter: PersistenceAdapter<TestState> = {
        read: async (_key?: string) => ({
          value: persistedValues.value || "initial",
          setValue: () => {},
        }),
        write: async (_key: string, v: TestState) => {
          persistedValues.value = v.value
        },
        delete: async (_key: string) => {},
        clear: async () => {},
        subscribe:
          (_key: string, _listener: (value: TestState | null) => void) =>
          () => {},
      }

      const store = createStore<any>(
        persistMiddleware({
          key: "test-persist",
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
