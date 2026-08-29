"use server"

import { cookies } from "next/headers"

export async function readCookie(name: string): Promise<string | undefined> {
  const cookieStore = await cookies()
  const value = cookieStore.get(name)?.value ?? null
  if (!value) return undefined

  return value
}
