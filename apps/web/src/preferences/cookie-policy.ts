import { appearancePreferenceSchema } from "@repo/domain-preferences"
import { defineCookie } from "@repo/services-cookies"
import {
  APPEARANCE_COOKIE_MAX_AGE,
  APPEARANCE_COOKIE_NAME,
} from "@repo/adapters-theme-next/appearance-cookie"

export const APPEARANCE_PREFERENCE_COOKIE = APPEARANCE_COOKIE_NAME

export const DEFAULT_COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: APPEARANCE_COOKIE_MAX_AGE,
} as const

export const appearanceCookie = defineCookie({
  name: APPEARANCE_PREFERENCE_COOKIE,
  options: DEFAULT_COOKIE_OPTIONS,
  codec: {
    parse(raw) {
      return appearancePreferenceSchema.parse(raw)
    },

    serialize(value) {
      const normalized = appearancePreferenceSchema.parse(value)

      return normalized
    },
  },
})
