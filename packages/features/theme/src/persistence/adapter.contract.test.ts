import { describe, expect, it, vi } from "vitest"

import { APPEARANCE_PREFERENCES } from "./types"
import type { AppearancePersistenceAdapter } from "./types"

// ---------------------------------------------------------------------------
// Shared adapter contract
//
// Every `AppearancePersistenceAdapter` implementation (localStorage,
// cookies, and any future backend) must satisfy this identical suite.
// `adapterFactory` is called once per test to produce a fresh adapter
// instance; adapter-specific setup/teardown (clearing localStorage, clearing
// cookies, etc.) belongs in the caller's `beforeEach`/`afterEach`, not here.
// ---------------------------------------------------------------------------

export function describeAdapterContract(
  adapterFactory: () => AppearancePersistenceAdapter
): void {
  describe("AppearancePersistenceAdapter contract", () => {
    describe("read()", () => {
      it("returns null when nothing has been persisted", () => {
        const adapter = adapterFactory()
        expect(adapter.read()).toBeNull()
      })

      it("returns the persisted preference after write()", () => {
        const adapter = adapterFactory()
        adapter.write("dark")
        expect(adapter.read()).toBe("dark")
      })

      it.each(APPEARANCE_PREFERENCES)(
        "round-trips the %s preference",
        (preference) => {
          const adapter = adapterFactory()
          adapter.write(preference)
          expect(adapter.read()).toBe(preference)
        }
      )
    })

    describe("write()", () => {
      it("persists all three preferences", () => {
        const adapter = adapterFactory()
        for (const preference of APPEARANCE_PREFERENCES) {
          adapter.write(preference)
          expect(adapter.read()).toBe(preference)
        }
      })

      it("overwrites a previously persisted preference", () => {
        const adapter = adapterFactory()
        adapter.write("light")
        adapter.write("dark")
        expect(adapter.read()).toBe("dark")
      })

      it("does not throw", () => {
        const adapter = adapterFactory()
        expect(() => adapter.write("system")).not.toThrow()
      })
    })

    describe("subscribe()", () => {
      it("returns an unsubscribe function", () => {
        const adapter = adapterFactory()
        const unsubscribe = adapter.subscribe(() => {})
        expect(typeof unsubscribe).toBe("function")
        unsubscribe()
      })

      it("unsubscribe is idempotent", () => {
        const adapter = adapterFactory()
        const unsubscribe = adapter.subscribe(() => {})
        expect(() => {
          unsubscribe()
          unsubscribe()
        }).not.toThrow()
      })

      it("does not call the listener as a result of this instance's own write() (no feedback loop)", () => {
        const adapter = adapterFactory()
        const listener = vi.fn()
        const unsubscribe = adapter.subscribe(listener)

        adapter.write("dark")
        adapter.write("dark")
        adapter.write("light")

        expect(listener).not.toHaveBeenCalled()
        unsubscribe()
      })

      it("stops notifying after unsubscribe", () => {
        const adapter = adapterFactory()
        const listener = vi.fn()
        const unsubscribe = adapter.subscribe(listener)

        unsubscribe()
        adapter.write("dark")

        expect(listener).not.toHaveBeenCalled()
      })
    })
  })
}

describe("adapter.contract test module", () => {
  it("exports describeAdapterContract for adapter-specific suites to consume", () => {
    expect(typeof describeAdapterContract).toBe("function")
  })
})
