export type PersistenceOperation =
  "read" | "write" | "remove" | "serialize" | "deserialize" | "subscribe"

export type PersistenceErrorCode =
  | "unavailable"
  | "storage"
  | "serialization"
  | "validation"
  | "observer"
  | "unsupported"

export interface PersistenceErrorOptions {
  code: PersistenceErrorCode
  operation: PersistenceOperation
  key?: string
  cause?: unknown
}

export class PersistenceError extends Error {
  readonly code: PersistenceErrorCode
  readonly operation: PersistenceOperation
  readonly key: string | undefined
  override readonly cause: unknown

  constructor(message: string, options: PersistenceErrorOptions) {
    super(message, { cause: options.cause })
    this.name = "PersistenceError"
    this.code = options.code
    this.operation = options.operation
    this.key = options.key
    this.cause = options.cause
  }
}

export function toPersistenceError(
  error: unknown,
  options: Omit<PersistenceErrorOptions, "cause">,
  message: string
): PersistenceError {
  if (error instanceof PersistenceError) {
    const key = error.key ?? options.key

    if (key === error.key) return error

    return new PersistenceError(message, {
      code: error.code,
      operation: error.operation,
      key,
      cause: error,
    })
  }

  return new PersistenceError(message, {
    ...options,
    cause: error,
  })
}
