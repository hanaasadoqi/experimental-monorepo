import type { CookieCodec, CookieDefinition, CookieOptions } from "./types.js"

export interface CookieDefinitionOptions<T> {
  name: string
  options?: CookieOptions
  codec: CookieCodec<T>
}

export function defineCookie<T>({
  name,
  options,
  codec,
}: CookieDefinitionOptions<T>): CookieDefinition<T> {
  return {
    name,
    options: Object.freeze({ ...options }),
    codec,

    parse(raw) {
      return codec.parse(raw)
    },

    safeParse(raw) {
      if (raw === undefined) {
        return undefined
      }

      try {
        return codec.parse(raw)
      } catch {
        return undefined
      }
    },

    serialize(value) {
      return codec.serialize(value)
    },
  }
}
