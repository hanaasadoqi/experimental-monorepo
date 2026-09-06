import type { CookieCodec } from "./types.js"

export const stringCookieCodec: CookieCodec<string> = {
  parse: (raw) => raw,
  serialize: (value) => value,
}

export function enumCookieCodec<const TValues extends readonly string[]>(
  values: TValues
): CookieCodec<TValues[number]> {
  const allowed = new Set<string>(values)

  return {
    parse(raw) {
      if (!allowed.has(raw)) {
        throw new TypeError(`Invalid cookie value: ${raw}`)
      }

      return raw as TValues[number]
    },

    serialize(value) {
      if (!allowed.has(value)) {
        throw new TypeError(`Invalid cookie value: ${value}`)
      }

      return value
    },
  }
}
