import { z } from "zod"

export type ValidationError = {
  field: string
  message: string
}

export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errors: ValidationError[] = result.error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }))

  return { success: false, errors }
}

export function parseSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}

export function tryParseSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  fallback: T
): T {
  try {
    return schema.parse(data)
  } catch {
    return fallback
  }
}
