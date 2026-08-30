import { appearancePreferenceSchema } from "@repo/feature-preferences";
import { defineCookie } from "@repo/services-cookies"

export const APPEARANCE_PREFERENCE_COOKIE = "appearance"

export const DEFAULT_COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 365, // 1 year
} as const

export const appearanceCookie =
  defineCookie({
    name: APPEARANCE_PREFERENCE_COOKIE,
    options: DEFAULT_COOKIE_OPTIONS,
    codec: {
      parse(raw) {
        return appearancePreferenceSchema.parse(raw)
      },

      serialize(value) {
        const normalized =
          appearancePreferenceSchema.parse(value)

        return normalized
      },
    },
  })
