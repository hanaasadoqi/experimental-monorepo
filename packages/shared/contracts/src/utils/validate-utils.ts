import { z } from "zod"

import type { TypeGuard } from "../types/index.js"

/** The value accepted by a schema before coercions or transforms run. */
export type SchemaInput<Schema extends z.ZodTypeAny> = z.input<Schema>

/** The validated value returned after coercions and transforms run. */
export type SchemaOutput<Schema extends z.ZodTypeAny> = z.output<Schema>

/**
 * A schema whose input and output are identical. Restricting guards and
 * assertions to this shape prevents transforms from producing unsound types.
 */
export type GuardSchema<Value> = z.ZodType<Value, z.ZodTypeDef, Value>

export function createSchemaGuard<Value>(
  schema: GuardSchema<Value>
): TypeGuard<Value> {
  return (value: unknown): value is Value => schema.safeParse(value).success
}

export function matchesSchema<Value>(
  schema: GuardSchema<Value>,
  value: unknown
): value is Value {
  return schema.safeParse(value).success
}

export function assertMatchesSchema<Value>(
  schema: GuardSchema<Value>,
  value: unknown
): asserts value is Value {
  schema.parse(value)
}

/** Parses an untrusted boundary value and returns the schema's output type. */
export function parseUnknown<Schema extends z.ZodTypeAny>(
  schema: Schema,
  value: unknown
): SchemaOutput<Schema> {
  return schema.parse(value) as SchemaOutput<Schema>
}

/** Safely parses an untrusted boundary value without erasing schema transforms. */
export function safeParseUnknown<Schema extends z.ZodTypeAny>(
  schema: Schema,
  value: unknown
): z.SafeParseReturnType<SchemaInput<Schema>, SchemaOutput<Schema>> {
  return schema.safeParse(value)
}
