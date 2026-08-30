import { cookies } from "next/headers"

import { appearanceCookie } from "../../preferences/cookie-policy"

export async function readAppearancePreferenceCookie() {
  const cookieStore = await cookies()

  return appearanceCookie.safeParse(
    cookieStore.get(appearanceCookie.name)?.value
  )
}
