import { readAppearanceCookie } from "@repo/adapters-theme-next/server"

export async function readAppearancePreferenceCookie() {
  return await readAppearanceCookie()
}
