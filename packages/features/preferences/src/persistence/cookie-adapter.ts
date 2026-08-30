import { appearancePreferenceSchema } from "@repo/shared-contracts"

import { APPEARANCE_PREFERENCE_COOKIE_NAME } from "./constants"
import type {
  CookiePreferencesAdapterOptions,
  PreferencesPersistenceAdapter,
} from "./types"

const DEFAULT_MAX_AGE = 31_536_000

function isHttps(): boolean {
  try {
    return typeof location !== "undefined" && location.protocol === "https:"
  } catch {
    return false
  }
}

function readCookie(name: string): string | null {
  try {
    const cookies =
      typeof document === "undefined" ? [] : document.cookie.split("; ")
    for (const cookie of cookies) {
      const separator = cookie.indexOf("=")
      if (separator >= 0 && cookie.slice(0, separator) === name) {
        return decodeURIComponent(cookie.slice(separator + 1))
      }
    }
  } catch {
    return null
  }
  return null
}

function createChannel(name: string): BroadcastChannel | null {
  try {
    return typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel(`preferences-cookie:${name}`)
  } catch {
    return null
  }
}

export function createCookiePreferencesAdapter(
  options: CookiePreferencesAdapterOptions = {}
): PreferencesPersistenceAdapter {
  const name = options.name ?? APPEARANCE_PREFERENCE_COOKIE_NAME
  const maxAge = options.maxAge ?? DEFAULT_MAX_AGE
  const path = options.path ?? "/"
  const sameSite = options.sameSite ?? "Lax"
  const secure = options.secure ?? isHttps()
  let channel: BroadcastChannel | null | undefined

  const getChannel = (): BroadcastChannel | null => {
    if (channel === undefined) {
      channel = createChannel(name)
    }
    return channel
  }

  return {
    read() {
      const result = appearancePreferenceSchema.safeParse(readCookie(name))
      return result.success ? result.data : null
    },
    write(preference) {
      try {
        if (typeof document === "undefined") return
        const attributes = [
          `${name}=${encodeURIComponent(preference)}`,
          `Max-Age=${maxAge}`,
          `Path=${path}`,
          `SameSite=${sameSite}`,
        ]
        if (secure) attributes.push("Secure")
        document.cookie = attributes.join("; ")
        getChannel()?.postMessage(preference)
      } catch {
        // Persistence failure must not invalidate active in-memory preferences.
      }
    },
    subscribe(listener) {
      const activeChannel = getChannel()
      if (!activeChannel) return () => undefined

      const handleMessage = (event: MessageEvent<unknown>): void => {
        const result = appearancePreferenceSchema.safeParse(event.data)
        if (result.success) listener(result.data)
      }

      activeChannel.addEventListener("message", handleMessage)
      return () => activeChannel.removeEventListener("message", handleMessage)
    },
  }
}
