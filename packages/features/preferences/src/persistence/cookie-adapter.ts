import { AppearancePreference, appearancePreferenceSchema, validateSchema } from "@repo/shared-contracts";
import { APPEARANCE_PREFERENCE_COOKIE_NAME, DEFAULT_MAX_AGE } from "./constants"
import type {
  CookiePreferencesAdapterOptions,
  PreferencesPersistenceAdapter,
} from "./types"
import { readCookie } from "@repo/shared-utils";
import { createChannel, isHttps } from "../server/server-utils";

export async function createCookiePreferencesAdapter(
  options: CookiePreferencesAdapterOptions = {}
): PreferencesPersistenceAdapter{
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
    read: async () => {
      const result = validateSchema<AppearancePreference>(appearancePreferenceSchema, readCookie(name))
      return await (result.success ? (result.data as AppearancePreference) : null)
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
