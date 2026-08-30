import { cookies } from "next/headers"

import { appearancePreferenceSchema } from "@repo/shared-contracts/schemas"

import { APPEARANCE_PREFERENCE_COOKIE } from "../../preferences/cookie-policy"

export async function readAppearancePreferenceCookie() {
  const cookieStore = await cookies()
  const value = cookieStore.get(APPEARANCE_PREFERENCE_COOKIE.name)?.value
  const result = appearancePreferenceSchema.safeParse(value)

  return result.success ? result.data : undefined
}
