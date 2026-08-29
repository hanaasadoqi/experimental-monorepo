"use server"

import { cookies } from "next/headers"
import type { AppearancePreference } from "../types"

const COOKIE_NAME = "appearance-preference"

export async function readAppearanceCookie(): Promise<
  AppearancePreference | undefined
> {
  const cookieStore = await cookies()
  const value = cookieStore.get(COOKIE_NAME)?.value

  if (!value) return undefined

  if (["light", "dark", "system"].includes(value)) {
    return value as AppearancePreference
  }

  return undefined
}
