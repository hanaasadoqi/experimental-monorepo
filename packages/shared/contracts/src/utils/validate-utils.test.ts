import { describe, expect, expectTypeOf, it } from "vitest"
import { z } from "zod"

import {
  assertMatchesSchema,
  createSchemaGuard,
  matchesSchema,
  parseUnknown,
  safeParseUnknown,
  type SchemaInput,
  type SchemaOutput,
} from "./validate-utils.js"

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
})

describe("validate-utils", () => {
  it("creates a type guard from a non-transforming schema", () => {
    const isUser = createSchemaGuard(userSchema)
    const value: unknown = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Ada",
    }

    expect(isUser(value)).toBe(true)
    if (isUser(value)) {
      expectTypeOf(value).toEqualTypeOf<z.infer<typeof userSchema>>()
    }
    expect(isUser({ id: "invalid", name: "Ada" })).toBe(false)
  })

  it("checks a value against a schema without throwing", () => {
    expect(matchesSchema(userSchema, { id: "invalid", name: "Ada" })).toBe(
      false
    )
  })

  it("asserts and narrows values with the schema error intact", () => {
    const value: unknown = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Ada",
    }

    assertMatchesSchema(userSchema, value)
    expectTypeOf(value).toEqualTypeOf<z.infer<typeof userSchema>>()
    expect(() => assertMatchesSchema(userSchema, {})).toThrow(z.ZodError)
  })

  it("preserves distinct schema input and output types when parsing", () => {
    const countSchema = z.string().transform(Number)
    type CountInput = SchemaInput<typeof countSchema>
    type CountOutput = SchemaOutput<typeof countSchema>

    expectTypeOf<CountInput>().toEqualTypeOf<string>()
    expectTypeOf<CountOutput>().toEqualTypeOf<number>()
    expect(parseUnknown(countSchema, "42")).toBe(42)

    const valid = safeParseUnknown(countSchema, "42")
    expect(valid.success).toBe(true)
    if (valid.success) expectTypeOf(valid.data).toEqualTypeOf<number>()

    expect(safeParseUnknown(countSchema, null).success).toBe(false)
  })
})
