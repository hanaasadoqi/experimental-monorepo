import { cookies } from "next/headers"

import {
  appearancePreferenceSchema,
  type AppearancePreference,
} from "@repo/feature-preferences"

import { APPEARANCE_PREFERENCE_COOKIE } from "../../preferences/cookie-policy"

export async function readAppearancePreferenceCookie(): Promise<
  AppearancePreference | undefined
> {
  const cookieStore = await cookies()

  const rawValue = cookieStore.get(APPEARANCE_PREFERENCE_COOKIE)?.value

  if (rawValue === undefined) {
    return undefined
  }

  const result = appearancePreferenceSchema.safeParse(rawValue)

  return result.success ? result.data : undefined
}
