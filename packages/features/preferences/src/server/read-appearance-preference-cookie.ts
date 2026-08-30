"use server";

import { appearancePreferenceSchema } from "@repo/shared-contracts"
import { readCookie } from "@repo/shared-utils/server"

import { APPEARANCE_PREFERENCE_COOKIE_NAME } from "../persistence/constants"

export async function readAppearancePreferenceCookie() {
  const result = appearancePreferenceSchema.safeParse(
    await readCookie(APPEARANCE_PREFERENCE_COOKIE_NAME)
  )
  return result.success ? result.data : undefined
}
