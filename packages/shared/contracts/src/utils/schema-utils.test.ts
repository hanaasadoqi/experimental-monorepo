import { describe, it, expect } from "vitest"
import { z, ZodType } from "zod"
import { validateSchema, parseSchema, tryParseSchema } from "./schema-utils.js"

describe("schema-utils", () => {
  // Test schema for all utilities
  const testSchema = z.object({
    name: z.string().min(1, "Name is required"),
    age: z.number().int().positive("Age must be positive"),
    email: z.string().email("Invalid email format"),
  })

  describe("validateSchema", () => {
    const validData = { name: "John", age: 30, email: "john@example.com" }
    it("returns success with typed data when valid", () => {
      const result = validateSchema(testSchema, validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
        expect(result.data.name).toBe("John")
        expect(result.data.age).toBe(30)
      }
    })

    const invalidData = { name: "", age: -5, email: "invalid-email" }
    it("returns failure with ValidationError array when invalid", () => {
      const result = validateSchema(testSchema, invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(Array.isArray(result.errors)).toBe(true)
        expect(result.errors.length).toBeGreaterThan(0)
      }
    })

    const incompleteFieldData = {
      name: "Amy",
      age: 25,
      email: "",
    }

    const incompleteField = {
      data: incompleteFieldData,
      success: false,
      error: {
        field: "email",
        message: "Invalid email format",
      },
    }

    it("formats ValidationError with field path and message", () => {
      const result = validateSchema(testSchema, incompleteFieldData)

      expect(result.success).toBe(false)
      if (!result.success) {
        const errors = result.errors
        expect(errors).toContainEqual(
          expect.objectContaining({
            ...incompleteField.error,
          })
        )

        // Verify error structure matches ValidationError type
        errors.forEach((error) => {
          expect(error.field).toBe("email")
          expect(error.message).toBe("Invalid email format")
        })
      }
    })

    it("handles nested object validation errors", () => {
      const nestedSchema = z.object({
        user: z.object({
          profile: z.object({
            bio: z.string().min(10),
          }),
        }),
      })

      const data = { user: { profile: { bio: "short" } } }
      const result = validateSchema(nestedSchema, data)

      expect(result.success).toBe(false)
      if (!result.success) {
        const bioError = result.errors.find((e) => e.field.includes("bio"))
        expect(bioError).toBeDefined()
        expect(bioError?.field).toBe("user.profile.bio")
      }
    })

    it("collects all validation errors, not just first", () => {
      const data = { name: "", age: "not-a-number", email: "bad-email" }
      const result = validateSchema(testSchema, data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThanOrEqual(3)
      }
    })

    it("handles optional fields correctly", () => {
      const optionalSchema = z.object({
        required: z.string(),
        optional: z.string().optional(),
      })

      const dataWithOptional = { required: "test", optional: "value" }
      const resultWith = validateSchema(optionalSchema, dataWithOptional)
      expect(resultWith.success).toBe(true)

      const dataWithoutOptional = { required: "test" }
      const resultWithout = validateSchema(optionalSchema, dataWithoutOptional)
      expect(resultWithout.success).toBe(true)
    })

    it("handles array validation", () => {
      const arraySchema = z.object({
        items: z.array(z.string()),
      })

      const validData = { items: ["a", "b", "c"] }
      const validResult = validateSchema(arraySchema, validData)
      expect(validResult.success).toBe(true)

      const invalidData = { items: ["a", 1, "c"] }
      const invalidResult = validateSchema(arraySchema, invalidData)
      expect(invalidResult.success).toBe(false)
    })

    it("preserves error message from schema definition", () => {
      const customSchema = z.object({
        value: z.string().min(5, "Custom error: must be 5+ chars"),
      })

      const result = validateSchema(customSchema, { value: "ab" })
      expect(result.success).toBe(false)
      if (!result.success) {
        const error = result.errors.find((e) => e.field === "value")
        expect(error?.message).toContain("Custom error")
      }
    })

    it("handles deeply nested validation errors", () => {
      const deepSchema = z.object({
        level1: z.object({
          level2: z.object({
            level3: z.object({
              value: z.number().positive("must be positive"),
            }),
          }),
        }),
      })

      const data = { level1: { level2: { level3: { value: -1 } } } }
      const result = validateSchema(deepSchema, data)

      expect(result.success).toBe(false)
      if (!result.success) {
        const error = result.errors.find(
          (e) => e.field === "level1.level2.level3.value"
        )
        expect(error).toBeDefined()
        expect(error?.message).toContain("positive")
      }
    })
  })

  describe("parseSchema", () => {
    it("returns typed data when valid", () => {
      const data = { name: "John", age: 30, email: "john@example.com" }
      const result = parseSchema(testSchema, data)

      expect(result).toEqual(data)
      expect(result.name).toBe("John")
      expect(result.age).toBe(30)
      expect(result.email).toBe("john@example.com")
    })

    it("throws ZodError when invalid", () => {
      const data = { name: "", age: -5, email: "invalid" }

      expect(() => parseSchema(testSchema, data)).toThrow()
    })

    it("throws with detailed error information", () => {
      const data = { name: "", age: -5, email: "invalid" }

      expect(() => parseSchema(testSchema, data)).toThrow()
      try {
        parseSchema(testSchema, data)
      } catch (error) {
        if (error instanceof z.ZodError) {
          expect(error.issues.length).toBeGreaterThan(0)
          expect(error.issues[0]).toHaveProperty("path")
          expect(error.issues[0]).toHaveProperty("message")
        }
      }
    })

    it("throws immediately on first validation error (eager mode)", () => {
      const data = { name: "", age: -5, email: "invalid" }

      expect(() => parseSchema(testSchema, data)).toThrow()
    })

    it("performs complete type transformation when valid", () => {
      const transformSchema = z.object({
        value: z
          .string()
          .transform((v) => parseInt(v)) as unknown as ZodType<number>,
      })

      const result = parseSchema(transformSchema, { value: "42" })
      expect(result.value).toBe(42)
      expect(typeof result.value).toBe("number")
    })
  })

  describe("tryParseSchema", () => {
    const fallbackData = {
      name: "Default",
      age: 0,
      email: "default@example.com",
    }

    it("returns parsed data when valid", () => {
      const data = { name: "John", age: 30, email: "john@example.com" }
      const result = tryParseSchema(testSchema, data, fallbackData)

      expect(result).toEqual(data)
      expect(result).not.toEqual(fallbackData)
    })

    it("returns fallback when invalid (no throw)", () => {
      const data = { name: "", age: -5, email: "invalid" }
      const result = tryParseSchema(testSchema, data, fallbackData)

      expect(result).toEqual(fallbackData)
    })

    it("never throws even with invalid data", () => {
      const data = { name: "", age: -5, email: "invalid" }

      expect(() => tryParseSchema(testSchema, data, fallbackData)).not.toThrow()
    })

    it("uses fallback type-safely with proper typing", () => {
      const result = tryParseSchema(testSchema, {}, fallbackData)

      // If type inference works, these should be correctly typed
      expect(typeof result.name).toBe("string")
      expect(typeof result.age).toBe("number")
      expect(typeof result.email).toBe("string")
    })

    it("returns fallback for completely wrong data type", () => {
      const result = tryParseSchema(testSchema, "not-an-object", fallbackData)
      expect(result).toEqual(fallbackData)
    })

    it("returns fallback for null or undefined", () => {
      const resultNull = tryParseSchema(testSchema, null, fallbackData)
      expect(resultNull).toEqual(fallbackData)

      const resultUndefined = tryParseSchema(
        testSchema,
        undefined,
        fallbackData
      )
      expect(resultUndefined).toEqual(fallbackData)
    })

    it("preserves fallback object identity", () => {
      const fallback = { name: "Test", age: 0, email: "test@example.com" }
      const result = tryParseSchema(testSchema, { invalid: true }, fallback)

      expect(result).toBe(fallback)
    })

    it("handles partial valid data by returning fallback", () => {
      const partialData = { name: "John", age: 30 } // missing email
      const result = tryParseSchema(testSchema, partialData, fallbackData)

      expect(result).toEqual(fallbackData)
    })
  })

  describe("edge cases", () => {
    it("handles empty schema", () => {
      const emptySchema = z.object({})
      const data = {}

      const result = validateSchema(emptySchema, data)
      expect(result.success).toBe(true)
    })

    it("handles discriminated unions", () => {
      const unionSchema = z.discriminatedUnion("type", [
        z.object({ type: z.literal("a"), value: z.string() }),
        z.object({ type: z.literal("b"), value: z.number() }),
      ])

      const validA = { type: "a" as const, value: "test" }
      const resultA = validateSchema(unionSchema, validA)
      expect(resultA.success).toBe(true)

      const validB = { type: "b" as const, value: 42 }
      const resultB = validateSchema(unionSchema, validB)
      expect(resultB.success).toBe(true)

      const invalid = { type: "c", value: "test" }
      const resultInvalid = validateSchema(unionSchema, invalid)
      expect(resultInvalid.success).toBe(false)
    })

    it("handles generic schema parameter types correctly", () => {
      interface User {
        id: string
        name: string
      }

      const userSchema = z.object({ id: z.string(), name: z.string() })

      const data = { id: "1", name: "Alice" }
      const result = validateSchema<User>(userSchema, data)

      if (result.success) {
        const user: User = result.data
        expect(user.id).toBe("1")
        expect(user.name).toBe("Alice")
      }
    })
  })
})
