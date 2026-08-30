export const APPEARANCE_PREFERENCE_COOKIE =
  "appearance"

export const APPEARANCE_PREFERENCE_COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
} as const
