import type { StateCreator } from "zustand"

import { describe, it, expect } from "vitest"
import {
  basicStateCreator,
  complexStateCreator,
  asyncStateCreator,
  type BasicState,
  type ComplexState,
  type AsyncState,
  type PersistedState,
  type RequiredState,
  type ActionState,
} from "./zustand.js"

describe("Zustand Store Type Fixtures", () => {
  describe("positive type cases", () => {
    it("should verify basicStateCreator provides correct type inference", () => {
      const creator = basicStateCreator
      expect(creator).toBeDefined()

      // Type assertions to verify compile-time correctness
      const _typeCheck: StateCreator<BasicState, [], []> = creator
      expect(_typeCheck).toBe(creator)
    })

    it("should verify complexStateCreator provides correct type inference", () => {
      const creator = complexStateCreator
      expect(creator).toBeDefined()

      const _typeCheck: StateCreator<ComplexState, [], []> = creator
      expect(_typeCheck).toBe(creator)
    })

    it("should verify asyncStateCreator provides correct type inference", () => {
      const creator = asyncStateCreator
      expect(creator).toBeDefined()

      const _typeCheck: StateCreator<AsyncState, [], []> = creator
      expect(_typeCheck).toBe(creator)
    })

    it("should document PersistedState interface for middleware patterns", () => {
      // PersistedState is a type reference for patterns using create() directly
      // with persist middleware - documented as a template
      const persistedExample: PersistedState = {
        count: 0,
        increment: () => {},
      }

      expect(persistedExample.count).toBe(0)
    })
  })

  describe("negative type cases (should fail type checking)", () => {
    it("should reject missing required state properties", () => {
      // @ts-expect-error — 'count' is required but missing in return value
      const _invalidCreator: StateCreator<RequiredState, []> = (set) => ({
        increment: () => set(({ count }) => ({ count: count + 1 })),
      })

      expect(_invalidCreator).toBeDefined()
    })

    it("should reject wrong action parameter types", () => {
      const _invalidCreator: StateCreator<ActionState, []> = (_set) => ({
        // @ts-expect-error — 'setValue' parameter type mismatch (string vs number)
        setValue: (_value: string) => {
          // Deliberately wrong type
        },
      })

      expect(_invalidCreator).toBeDefined()
    })
  })
})
