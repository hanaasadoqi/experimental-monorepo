import type { AppearancePreference } from "../types"
import { readCookie } from "@repo/shared-utils/server"

const APPEARANCE_COOKIE_NAME = "appearance-preference"

export async function readAppearanceCookie(): Promise<
  AppearancePreference | undefined
> {
  const value = await readCookie(APPEARANCE_COOKIE_NAME)

  if (!value) return undefined
  if (["light", "dark", "system"].includes(value)) {
    return value as AppearancePreference
  }

  return undefined
}
