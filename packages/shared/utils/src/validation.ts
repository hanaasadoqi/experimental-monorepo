import type { TypeGuard } from "@repo/shared-contracts/types"
import {
  EMAIL_PATTERN,
  UUID_PATTERN,
  HTTP_URL_PATTERN,
} from "@repo/shared-contracts/defaults/storage"
export const isString = (value: unknown): value is string =>
  typeof value === "string"

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length !== 0

/** Returns true only for finite primitive numbers. */
export const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value)

export const isInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value)

export const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean"

export const isNullish = (value: unknown): value is null | undefined =>
  value == null

export const isDate = (value: unknown): value is Date =>
  value instanceof Date && !Number.isNaN(value.getTime())

export function isArray(value: unknown): value is unknown[]
export function isArray<T>(value: unknown, itemGuard: TypeGuard<T>): value is T[]
export function isArray<T>(
  value: unknown,
  itemGuard?: TypeGuard<T>
): value is T[] {
  if (!Array.isArray(value)) return false
  if (itemGuard === undefined) return true

  for (let index = 0; index < value.length; index += 1) {
    if (!(index in value) || !itemGuard(value[index])) return false
  }
  return true
}

export function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

export function isRecord<T>(
  value: unknown,
  valueGuard?: TypeGuard<T>
): value is Record<string, T> {
  if (!isPlainObject(value)) return false
  if (valueGuard === undefined) return true

  const values = Object.values(value)
  for (let index = 0; index < values.length; index += 1) {
    if (!valueGuard(values[index])) return false
  }
  return true
}

export const isEmail = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length <= 254 &&
  EMAIL_PATTERN.test(value)

export const isUrl = (value: unknown): value is string =>
  typeof value === "string" && HTTP_URL_PATTERN.test(value)

export const isUuid = (value: unknown): value is string =>
  typeof value === "string" && UUID_PATTERN.test(value)

export function isValidJson(value: unknown): value is string {
  if (typeof value !== "string") return false
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}

export function isValueIn<const T>(
  value: unknown,
  allowedValues: readonly T[]
): value is T {
  return allowedValues.includes(value as T)
}

export function hasOwn<Key extends PropertyKey>(
  value: object,
  key: Key
): value is object & Record<Key, unknown> {
  return Object.prototype.hasOwnProperty.call(value, key)
}
