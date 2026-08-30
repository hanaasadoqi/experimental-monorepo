import type { PersistenceAdapter } from "../types/index.js"
import { isBrowser, isCookieAvailable } from "../utils/ssr.js"

const COOKIE_NAME_PATTERN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/
const DEFAULT_MAX_AGE = 31_536_000
const DEFAULT_POLL_INTERVAL = 1_000

export type CookieSameSite = "strict" | "lax" | "none"

export interface CookieAdapterOptions {
  /** Cookie lifetime in seconds. Defaults to one year. */
  maxAge?: number
  /** Cookie path. Defaults to `/`. */
  path?: string
  /** Optional cookie domain. */
  domain?: string
  /** SameSite policy. Defaults to `lax`. */
  sameSite?: CookieSameSite
  /** Secure flag. Defaults to true on HTTPS pages. */
  secure?: boolean
  /** Polling interval used to observe writes from other browser contexts. */
  pollInterval?: number
}

interface NormalizedCookieOptions {
  maxAge: number
  path: string
  domain?: string
  sameSite: CookieSameSite
  secure: boolean
  pollInterval: number
}

function assertCookieName(name: string): void {
  if (!COOKIE_NAME_PATTERN.test(name)) {
    throw new TypeError(`Invalid cookie name: ${JSON.stringify(name)}`)
  }
}

function assertCookieAttribute(name: string, value: string): void {
  const hasInvalidCharacter = Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0)

    return (
      character === ";" ||
      codePoint === undefined ||
      codePoint <= 0x1f ||
      codePoint === 0x7f
    )
  })

  if (value.length === 0 || hasInvalidCharacter) {
    throw new TypeError(`Invalid cookie ${name}`)
  }
}

function normalizeOptions(
  options: CookieAdapterOptions
): NormalizedCookieOptions {
  const maxAge = options.maxAge ?? DEFAULT_MAX_AGE
  const path = options.path ?? "/"
  const sameSite = options.sameSite ?? "lax"
  const secure =
    options.secure ??
    (typeof location !== "undefined" && location.protocol === "https:")
  const pollInterval = options.pollInterval ?? DEFAULT_POLL_INTERVAL

  if (!Number.isSafeInteger(maxAge) || maxAge < 0) {
    throw new TypeError("Cookie maxAge must be a non-negative safe integer")
  }
  if (!Number.isSafeInteger(pollInterval) || pollInterval <= 0) {
    throw new TypeError("Cookie pollInterval must be a positive safe integer")
  }

  assertCookieAttribute("path", path)
  if (options.domain !== undefined) {
    assertCookieAttribute("domain", options.domain)
  }
  if (sameSite === "none" && !secure) {
    throw new TypeError("SameSite=None cookies must also be Secure")
  }

  return {
    maxAge,
    path,
    ...(options.domain === undefined ? {} : { domain: options.domain }),
    sameSite,
    secure,
    pollInterval,
  }
}

function readEncodedCookie(name: string): string | null {
  if (!isBrowser() || !isCookieAvailable()) return null

  try {
    const cookies = document.cookie.split(";")
    for (let index = 0; index < cookies.length; index += 1) {
      const cookie = cookies[index]?.trim()
      if (!cookie) continue

      const separator = cookie.indexOf("=")
      if (separator < 0 || cookie.slice(0, separator) !== name) continue

      return cookie.slice(separator + 1)
    }
  } catch {
    return null
  }

  return null
}

function parseCookie<T>(name: string): T | null {
  const encoded = readEncodedCookie(name)
  if (encoded === null || encoded.length === 0) return null

  try {
    return JSON.parse(decodeURIComponent(encoded)) as T
  } catch {
    return null
  }
}

function cookieAttributes(
  options: NormalizedCookieOptions,
  maxAge = options.maxAge
): string[] {
  const attributes = [
    `Max-Age=${maxAge}`,
    `Path=${options.path}`,
    `SameSite=${options.sameSite[0]?.toUpperCase()}${options.sameSite.slice(1)}`,
  ]

  if (options.domain !== undefined) attributes.push(`Domain=${options.domain}`)
  if (options.secure) attributes.push("Secure")

  return attributes
}

/**
 * Creates an SSR-safe browser-cookie persistence adapter.
 *
 * Browser JavaScript cannot create `HttpOnly` cookies. Use a server response
 * when that protection is required.
 */
export const createCookieAdapter = <T>(
  defaultKey: string,
  options: CookieAdapterOptions = {}
): PersistenceAdapter<T> => {
  assertCookieName(defaultKey)
  const normalizedOptions = normalizeOptions(options)

  const resolveKey = (key?: string): string => {
    const resolvedKey = key ?? defaultKey
    assertCookieName(resolvedKey)
    return resolvedKey
  }

  const remove = (key: string): void => {
    if (!isBrowser() || !isCookieAvailable()) return
    document.cookie = [
      `${key}=`,
      ...cookieAttributes(normalizedOptions, 0),
    ].join("; ")
  }

  return {
    async read(key?: string): Promise<T | null> {
      return parseCookie<T>(resolveKey(key))
    },

    async write(key: string, state: T): Promise<void> {
      const cookieKey = resolveKey(key)
      if (!isBrowser() || !isCookieAvailable()) return

      const serialized = JSON.stringify(state)
      if (serialized === undefined) {
        throw new TypeError("Cookie persistence cannot serialize undefined")
      }

      document.cookie = [
        `${cookieKey}=${encodeURIComponent(serialized)}`,
        ...cookieAttributes(normalizedOptions),
      ].join("; ")
    },

    async delete(key: string): Promise<void> {
      remove(resolveKey(key))
    },

    async clear(): Promise<void> {
      remove(defaultKey)
    },

    subscribe(key: string, listener: (value: T | null) => void): () => void {
      const cookieKey = resolveKey(key)
      if (!isBrowser() || !isCookieAvailable()) return () => undefined

      let previousEncodedValue = readEncodedCookie(cookieKey)
      const interval = window.setInterval(() => {
        const encodedValue = readEncodedCookie(cookieKey)
        if (encodedValue === previousEncodedValue) return

        previousEncodedValue = encodedValue
        listener(parseCookie<T>(cookieKey))
      }, normalizedOptions.pollInterval)

      return () => window.clearInterval(interval)
    },
  }
}
