import type { AppearancePreference } from "../types"
import { APPEARANCE_PREFERENCES } from "./types"
import type { AppearancePersistenceAdapter } from "./types"

export interface CookieAdapterOptions {
  /** Cookie name. Defaults to `'appearance-preference'`. */
  name?: string
  /** Max-Age in seconds. Defaults to `31536000` (1 year). */
  maxAge?: number
  /** Cookie path. Defaults to `'/'`. */
  path?: string
  /** SameSite attribute. Defaults to `'Lax'`. */
  sameSite?: "Strict" | "Lax" | "None"
  /**
   * Whether to mark the cookie `Secure`. Defaults to auto-detecting HTTPS
   * via `location.protocol`.
   */
  secure?: boolean
}

interface ResolvedCookieAdapterOptions {
  name: string
  maxAge: number
  path: string
  sameSite: "Strict" | "Lax" | "None"
  secure: boolean
}

const DEFAULT_NAME = "appearance-preference"
const DEFAULT_MAX_AGE = 31536000
const DEFAULT_PATH = "/"
const DEFAULT_SAME_SITE = "Lax"

function detectHttps(): boolean {
  try {
    return typeof location !== "undefined" && location.protocol === "https:"
  } catch {
    return false
  }
}

function resolveOptions(
  options: CookieAdapterOptions | undefined
): ResolvedCookieAdapterOptions {
  return {
    name: options?.name ?? DEFAULT_NAME,
    maxAge: options?.maxAge ?? DEFAULT_MAX_AGE,
    path: options?.path ?? DEFAULT_PATH,
    sameSite: options?.sameSite ?? DEFAULT_SAME_SITE,
    secure: options?.secure ?? detectHttps(),
  }
}

function isAppearancePreference(value: unknown): value is AppearancePreference {
  return (
    typeof value === "string" &&
    (APPEARANCE_PREFERENCES as readonly string[]).includes(value)
  )
}

function readCookieValue(name: string): string | null {
  try {
    if (typeof document === "undefined") {
      return null
    }

    const cookies = document.cookie ? document.cookie.split("; ") : []
    for (const cookie of cookies) {
      const separatorIndex = cookie.indexOf("=")
      if (separatorIndex === -1) {
        continue
      }

      const cookieName = cookie.slice(0, separatorIndex)
      if (cookieName === name) {
        return decodeURIComponent(cookie.slice(separatorIndex + 1))
      }
    }

    return null
  } catch {
    return null
  }
}

function writeCookieValue(
  value: string,
  options: ResolvedCookieAdapterOptions
): void {
  try {
    if (typeof document === "undefined") {
      return
    }

    const parts = [
      `${options.name}=${encodeURIComponent(value)}`,
      `Max-Age=${options.maxAge}`,
      `Path=${options.path}`,
      `SameSite=${options.sameSite}`,
    ]

    if (options.secure) {
      parts.push("Secure")
    }

    document.cookie = parts.join("; ")
  } catch {
    // document.cookie can throw in sandboxed/restricted contexts; fail
    // silently and keep in-memory state valid.
  }
}

function getBroadcastChannel(name: string): BroadcastChannel | null {
  try {
    if (typeof BroadcastChannel === "undefined") {
      return null
    }
    return new BroadcastChannel(`appearance-cookie:${name}`)
  } catch {
    return null
  }
}

/**
 * Persists the appearance preference to a cookie so it is readable during
 * server-side rendering (Task 8). Cross-tab synchronization uses
 * `BroadcastChannel` when available; `document.cookie` changes do not emit
 * a browser event, so tabs without `BroadcastChannel` support simply pick
 * up the latest cookie value on their next read (e.g. after a reload).
 *
 * Safe to call in non-browser environments (SSR): all reads/writes/
 * subscriptions become no-ops when `document` or `BroadcastChannel` is
 * unavailable.
 */
export function createCookieAppearanceAdapter(
  options?: CookieAdapterOptions
): AppearancePersistenceAdapter {
  const resolved = resolveOptions(options)

  // A single BroadcastChannel is shared by write() and subscribe() for the
  // lifetime of this adapter instance. Sharing one channel object matters:
  // a BroadcastChannel never delivers a message back to the object that
  // posted it, which is exactly the "own write doesn't notify own
  // subscribers" guarantee this adapter must uphold. Using a fresh channel
  // object per call would defeat that self-exclusion.
  let channel: BroadcastChannel | null | undefined

  function getChannel(): BroadcastChannel | null {
    if (channel === undefined) {
      channel = getBroadcastChannel(resolved.name)
    }
    return channel
  }

  return {
    read(): AppearancePreference | null {
      const raw = readCookieValue(resolved.name)
      return isAppearancePreference(raw) ? raw : null
    },

    write(preference: AppearancePreference): void {
      writeCookieValue(preference, resolved)

      const activeChannel = getChannel()
      if (activeChannel) {
        try {
          activeChannel.postMessage(preference)
        } catch {
          // Ignore postMessage failures; the write itself already
          // succeeded (or failed silently) above.
        }
      }
    },

    subscribe(
      listener: (preference: AppearancePreference) => void
    ): () => void {
      const activeChannel = getChannel()
      if (!activeChannel) {
        return () => {}
      }

      const handleMessage = (event: MessageEvent<unknown>): void => {
        if (isAppearancePreference(event.data)) {
          listener(event.data)
        }
      }

      activeChannel.addEventListener("message", handleMessage)

      let unsubscribed = false
      return () => {
        if (unsubscribed) {
          return
        }
        unsubscribed = true
        activeChannel.removeEventListener("message", handleMessage)
      }
    },
  }
}
