/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest"
import { shallowEqual, type EqualityFn } from "./shallow-equal"

describe("shallowEqual", () => {
  describe("identity checks", () => {
    it("returns true when values are identical", () => {
      const obj = { a: 1, b: 2 }
      expect(shallowEqual(obj, obj)).toBe(true)
    })

    it("returns true when comparing the same reference", () => {
      const a = {}
      const b = a
      expect(shallowEqual(a, b)).toBe(true)
    })
  })

  describe("primitive value checks", () => {
    it("returns false when first argument is null", () => {
      expect(shallowEqual(null as any, { a: 1 })).toBe(false)
    })

    it("returns false when second argument is null", () => {
      expect(shallowEqual({ a: 1 }, null as any)).toBe(false)
    })

    it("returns true when both arguments are null (identity check)", () => {
      expect(shallowEqual(null as any, null as any)).toBe(true)
    })

    it("returns false when first argument is undefined", () => {
      expect(shallowEqual(undefined as any, { a: 1 })).toBe(false)
    })

    it("returns false when second argument is undefined", () => {
      expect(shallowEqual({ a: 1 }, undefined as any)).toBe(false)
    })

    it("returns false when comparing with non-object types", () => {
      expect(shallowEqual("string" as any, { a: 1 })).toBe(false)
      expect(shallowEqual(42 as any, { a: 1 })).toBe(false)
      expect(shallowEqual(true as any, { a: 1 })).toBe(false)
    })

    it("returns false when both are non-objects", () => {
      expect(shallowEqual("a" as any, "b" as any)).toBe(false)
      expect(shallowEqual(1 as any, 2 as any)).toBe(false)
    })
  })

  describe("key comparison", () => {
    it("returns false when objects have different key counts", () => {
      const a = { x: 1, y: 2 }
      const b = { x: 1, y: 2, z: 3 }
      expect(shallowEqual(a, b)).toBe(false)
    })

    it("returns false when first object has fewer keys", () => {
      const a = { x: 1 }
      const b = { x: 1, y: 2 }
      expect(shallowEqual(a, b)).toBe(false)
    })

    it("returns false when first object has more keys", () => {
      const a = { x: 1, y: 2 }
      const b = { x: 1 }
      expect(shallowEqual(a, b)).toBe(false)
    })

    it("returns false when objects have same key count but different keys", () => {
      const a = { x: 1, y: 2 }
      const b = { x: 1, z: 2, y: 3 }
      expect(shallowEqual(a, b)).toBe(false)
    })
  })

  describe("value comparison", () => {
    it("returns true when all primitive values match", () => {
      const a = { name: "John", age: 30, active: true }
      const b = { name: "John", age: 30, active: true }
      expect(shallowEqual(a, b)).toBe(true)
    })

    it("returns false when one primitive value differs", () => {
      const a = { name: "John", age: 30 }
      const b = { name: "Jane", age: 30 }
      expect(shallowEqual(a, b)).toBe(false)
    })

    it("returns false when numeric values differ", () => {
      const a = { count: 5 }
      const b = { count: 6 }
      expect(shallowEqual(a, b)).toBe(false)
    })

    it("returns false when boolean values differ", () => {
      const a = { active: true }
      const b = { active: false }
      expect(shallowEqual(a, b)).toBe(false)
    })

    it("returns false when string values differ", () => {
      const a = { message: "hello" }
      const b = { message: "world" }
      expect(shallowEqual(a, b)).toBe(false)
    })

    it("handles null values in properties", () => {
      const a = { value: null }
      const b = { value: null }
      expect(shallowEqual(a, b)).toBe(true)
    })

    it("returns false when one property is null and the other is not", () => {
      const a = { value: null }
      const b = { value: undefined }
      expect(shallowEqual(a, b as any)).toBe(false)
    })

    it("returns false when one property is undefined and the other is not", () => {
      const a = { value: undefined }
      const b = { value: 0 }
      expect(shallowEqual(a, b as any)).toBe(false)
    })

    it("handles zero correctly (not falsy check)", () => {
      const a = { value: 0 }
      const b = { value: 0 }
      expect(shallowEqual(a, b)).toBe(true)
    })

    it("handles empty string correctly (not falsy check)", () => {
      const a = { value: "" }
      const b = { value: "" }
      expect(shallowEqual(a, b)).toBe(true)
    })

    it("handles false correctly (not falsy check)", () => {
      const a = { value: false }
      const b = { value: false }
      expect(shallowEqual(a, b)).toBe(true)
    })
  })

  describe("object reference comparison (shallow)", () => {
    it("returns true when nested objects are the same reference", () => {
      const nested = { key: "value" }
      const a = { obj: nested }
      const b = { obj: nested }
      expect(shallowEqual(a, b)).toBe(true)
    })

    it("returns false when nested objects are different instances", () => {
      const a = { obj: { key: "value" } }
      const b = { obj: { key: "value" } }
      expect(shallowEqual(a, b)).toBe(false)
    })

    it("returns false when array values differ (by reference)", () => {
      const a = { items: [1, 2, 3] }
      const b = { items: [1, 2, 3] }
      expect(shallowEqual(a, b)).toBe(false)
    })

    it("returns true when arrays are the same reference", () => {
      const arr = [1, 2, 3]
      const a = { items: arr }
      const b = { items: arr }
      expect(shallowEqual(a, b)).toBe(true)
    })
  })

  describe("multiple properties", () => {
    it("compares multiple properties correctly", () => {
      const a = {
        id: 1,
        name: "Alice",
        email: "alice@example.com",
        active: true,
      }
      const b = {
        id: 1,
        name: "Alice",
        email: "alice@example.com",
        active: true,
      }
      expect(shallowEqual(a, b)).toBe(true)
    })

    it("returns false when any property differs", () => {
      const a = {
        id: 1,
        name: "Alice",
        email: "alice@example.com",
        active: true,
      }
      const b = {
        id: 1,
        name: "Alice",
        email: "alice@example.com",
        active: false,
      }
      expect(shallowEqual(a, b)).toBe(false)
    })

    it("handles objects with many properties", () => {
      const a = {
        prop1: "a",
        prop2: "b",
        prop3: "c",
        prop4: "d",
        prop5: "e",
        prop6: "f",
      }
      const b = {
        prop1: "a",
        prop2: "b",
        prop3: "c",
        prop4: "d",
        prop5: "e",
        prop6: "f",
      }
      expect(shallowEqual(a, b)).toBe(true)
    })
  })

  describe("empty objects", () => {
    it("returns true for two empty objects", () => {
      expect(shallowEqual({}, {})).toBe(true)
    })

    it("returns false when comparing empty to non-empty", () => {
      expect(shallowEqual({}, { a: 1 })).toBe(false)
      expect(shallowEqual({ a: 1 }, {})).toBe(false)
    })
  })

  describe("edge cases", () => {
    it("handles NaN values (strict equality, not isNaN)", () => {
      const a = { value: NaN }
      const b = { value: NaN }
      // NaN !== NaN, so this should return false
      expect(shallowEqual(a, b)).toBe(false)
    })

    it("handles Infinity correctly", () => {
      const a = { value: Infinity }
      const b = { value: Infinity }
      expect(shallowEqual(a, b)).toBe(true)
    })

    it("handles negative Infinity correctly", () => {
      const a = { value: -Infinity }
      const b = { value: -Infinity }
      expect(shallowEqual(a, b)).toBe(true)
    })

    it("distinguishes between positive and negative Infinity", () => {
      const a = { value: Infinity }
      const b = { value: -Infinity }
      expect(shallowEqual(a, b)).toBe(false)
    })

    it("handles bigint values", () => {
      const a = { value: BigInt(9007199254740991) }
      const b = { value: BigInt(9007199254740991) }
      expect(shallowEqual(a, b)).toBe(true)
    })

    it("distinguishes between different bigint values", () => {
      const a = { value: BigInt(100) }
      const b = { value: BigInt(101) }
      expect(shallowEqual(a, b)).toBe(false)
    })

    it("handles Symbol values", () => {
      const sym = Symbol("test")
      const a = { value: sym }
      const b = { value: sym }
      expect(shallowEqual(a, b)).toBe(true)
    })

    it("distinguishes between different Symbol values", () => {
      const a = { value: Symbol("test") }
      const b = { value: Symbol("test") }
      expect(shallowEqual(a, b)).toBe(false)
    })

    it("handles objects with symbol keys", () => {
      const sym = Symbol("key")
      const a: Record<string | symbol, unknown> = { [sym]: "value" }
      const b: Record<string | symbol, unknown> = { [sym]: "value" }
      // Symbol keys are not enumerable by Object.keys(), so they won't be compared
      // This should return true since Object.keys() returns empty array
      expect(shallowEqual(a as any, b as any)).toBe(true)
    })

    it("ignores non-enumerable properties", () => {
      const a = { visible: 1 }
      Object.defineProperty(a, "hidden", {
        value: 2,
        enumerable: false,
      })

      const b = { visible: 1, hidden: 2 }
      expect(shallowEqual(a, b)).toBe(false)
    })
  })

  describe("type safety (EqualityFn)", () => {
    it("can be used as EqualityFn type", () => {
      const equalityFn: EqualityFn<{ x: number; y: number }> = shallowEqual

      const obj1 = { x: 1, y: 2 }
      const obj2 = { x: 1, y: 2 }

      expect(equalityFn(obj1, obj2)).toBe(true)
    })

    it("maintains type safety for different object shapes", () => {
      const userEqualityFn: EqualityFn<{
        id: number
        name: string
        active: boolean
      }> = shallowEqual

      const user1 = { id: 1, name: "Alice", active: true }
      const user2 = { id: 1, name: "Alice", active: true }

      expect(userEqualityFn(user1, user2)).toBe(true)
    })
  })

  describe("real-world scenarios", () => {
    it("compares pagination state objects", () => {
      const state1 = { page: 1, pageSize: 10, total: 100 }
      const state2 = { page: 1, pageSize: 10, total: 100 }
      expect(shallowEqual(state1, state2)).toBe(true)
    })

    it("detects pagination state changes", () => {
      const state1 = { page: 1, pageSize: 10, total: 100 }
      const state2 = { page: 2, pageSize: 10, total: 100 }
      expect(shallowEqual(state1, state2)).toBe(false)
    })

    it("compares filter criteria", () => {
      const filters1 = { status: "active", priority: "high", category: "bug" }
      const filters2 = { status: "active", priority: "high", category: "bug" }
      expect(shallowEqual(filters1, filters2)).toBe(true)
    })

    it("compares UI state objects", () => {
      const uiState1 = { isOpen: true, isLoading: false, isDirty: false }
      const uiState2 = { isOpen: true, isLoading: false, isDirty: false }
      expect(shallowEqual(uiState1, uiState2)).toBe(true)
    })

    it("distinguishes minor UI state changes", () => {
      const uiState1 = { isOpen: true, isLoading: false, isDirty: false }
      const uiState2 = { isOpen: true, isLoading: true, isDirty: false }
      expect(shallowEqual(uiState1, uiState2)).toBe(false)
    })

    it("handles config objects with mixed types", () => {
      const config1 = {
        apiUrl: "https://api.example.com",
        timeout: 5000,
        retries: 3,
        debug: false,
      }
      const config2 = {
        apiUrl: "https://api.example.com",
        timeout: 5000,
        retries: 3,
        debug: false,
      }
      expect(shallowEqual(config1, config2)).toBe(true)
    })
  })
})
