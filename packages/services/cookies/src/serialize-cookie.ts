import type { CookieDefinition } from "./types.js"

export function formatSameSite(
  value: "lax" | "strict" | "none"
): "Lax" | "Strict" | "None" {
  switch (value) {
    case "lax":
      return "Lax"
    case "strict":
      return "Strict"
    case "none":
      return "None"
  }
}

export function serializeCookie<T>(
  definition: CookieDefinition<T>,
  value: T
): string {
  const parts = [`${definition.name}=${definition.serialize(value)}`]

  const { options } = definition

  if (options.path) {
    parts.push(`Path=${options.path}`)
  }

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`)
  }

  if (options.sameSite) {
    parts.push(`SameSite=${formatSameSite(options.sameSite)}`)
  }

  if (options.secure) {
    parts.push("Secure")
  }

  return parts.join("; ")
}
