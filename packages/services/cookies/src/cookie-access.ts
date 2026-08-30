import type {
  CookieDefinition,
  CookieReader,
  CookieWriter,
} from "./types.js"

export interface ReadCookieResult<T> {
  value: T | null
  valid: boolean
}

export function readCookie<T>(
  reader: CookieReader,
  definition: CookieDefinition<T>,
): ReadCookieResult<T> {
  const raw = reader.get(definition.name)

  if (raw === undefined) {
    return { value: null, valid: true }
  }

  try {
    return {
      value: definition.codec.parse(raw),
      valid: true,
    }
  } catch {
    return {
      value: null,
      valid: false,
    }
  }
}

export function setCookie<T>(
  writer: CookieWriter,
  definition: CookieDefinition<T>,
  value: T,
): void {
  writer.set(
    definition.name,
    definition.codec.serialize(value),
    definition.options,
  )
}

export function deleteCookie<T>(
  writer: CookieWriter,
  definition: CookieDefinition<T>,
): void {
  writer.delete(definition.name, {
    path: definition.options.path,
    domain: definition.options.domain,
  })
}
