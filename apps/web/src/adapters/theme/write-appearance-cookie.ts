import { cookies } from "next/headers"
import type { AppearancePreference } from "@repo/features-preferences"

export async function writeAppearanceCookie(preference: AppearancePreference): Promise<void> {
  const store = await cookies()
  store.set("appearance", JSON.stringify(preference), {
    maxAge: 31536000, // 1 year
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
}
