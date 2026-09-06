import test from "node:test"
import assert from "node:assert/strict"
import { createSequentialMigration } from "../src/persist/create-sequential-migration.ts"
import {
  rehydrateStore,
  isStoreHydrated,
  subscribeToHydration,
} from "../src/hydration/index.ts"
import { subscribeToStorageRehydration } from "../src/persist/subscribe-storage-rehydration.ts"
import { createResetRegistry } from "../src/testing/create-reset-registry.ts"

test("migration runs each later version in ascending order", async () => {
  const migrate = createSequentialMigration({
    1: (state) => ({ ...state, count: state.count + 1 }),
    2: (state) => ({ ...state, label: "v2" }),
    3: (state) => ({ ...state, count: state.count * 2 }),
  })
  assert.deepEqual(await migrate({ count: 1 }, 0), { count: 4, label: "v2" })
  assert.deepEqual(await migrate({ count: 2, label: "v2" }, 2), {
    count: 4,
    label: "v2",
  })
})

test("rehydration helpers delegate to persist lifecycle", async () => {
  let hydrated = false
  let calls = 0
  const store = {
    persist: {
      rehydrate: async () => {
        calls += 1
        hydrated = true
      },
      hasHydrated: () => hydrated,
      onHydrate: () => () => {},
      onFinishHydration: () => () => {},
    },
  }
  assert.equal(isStoreHydrated(store), false)
  await rehydrateStore(store)
  assert.equal(calls, 1)
  assert.equal(isStoreHydrated(store), true)
})

test("subscribeToHydration reports start and finish", () => {
  let onStart
  let onFinish
  const store = {
    persist: {
      rehydrate: async () => {},
      hasHydrated: () => false,
      onHydrate: (fn) => {
        onStart = fn
        return () => {}
      },
      onFinishHydration: (fn) => {
        onFinish = fn
        return () => {}
      },
    },
  }
  const states = []
  const unsubscribe = subscribeToHydration(store, (value) => states.push(value))
  onStart()
  onFinish()
  unsubscribe()
  assert.deepEqual(states, [false, true])
})

test("storage sync only rehydrates matching key", async () => {
  const listeners = new Set()
  const target = {
    addEventListener: (_type, fn) => listeners.add(fn),
    removeEventListener: (_type, fn) => listeners.delete(fn),
  }
  let calls = 0
  const store = {
    persist: {
      getOptions: () => ({ name: "prefs" }),
      rehydrate: async () => {
        calls += 1
      },
    },
  }
  const unsubscribe = subscribeToStorageRehydration(store, target)
  for (const fn of listeners) fn({ key: "other", newValue: "{}" })
  for (const fn of listeners) fn({ key: "prefs", newValue: "{}" })
  await Promise.resolve()
  assert.equal(calls, 1)
  unsubscribe()
  assert.equal(listeners.size, 0)
})

test("reset registry runs all registered resetters and supports unregister", () => {
  const registry = createResetRegistry()
  let a = 0
  let b = 0
  const unregisterA = registry.register(() => {
    a += 1
  })
  registry.register(() => {
    b += 1
  })
  registry.resetAll()
  assert.equal(a, 1)
  assert.equal(b, 1)
  unregisterA()
  registry.resetAll()
  assert.equal(a, 1)
  assert.equal(b, 2)
})
