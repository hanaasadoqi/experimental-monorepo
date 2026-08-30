import type { PersistenceAdapter } from "../types/index.js"
import { isBrowser, isCookieAvailable } from "../utils/ssr.js"

export interface CookieAdapterOptions {
  /**
   * Cookie max-age in seconds. Defaults to 1 year.
   */
  maxAge?: number
}

/**
 * Create a cookie-based persistence adapter.
 * Safe for SSR - read/write operations gracefully skip in non-browser environments.
 *
 * Note: Read operations happen synchronously via document.cookie parsing.
 * Writes are deferred to avoid layout thrashing.
 *
 * @param key The cookie name
 * @param options Cookie options
 */
export const createCookieAdapter = <T>(
  defaultKey: string,
  options: CookieAdapterOptions = {}
): PersistenceAdapter<T> => {
  const maxAge = options.maxAge ?? 365 * 24 * 60 * 60 // 1 year

  const parseValue = (cookieKey: string): T | null => {
    if (!isBrowser() || !isCookieAvailable()) {
      return null
    }

    try {
      const match = document.cookie
        .split("; ")
        .find((c) => c.startsWith(`${cookieKey}=`))

      if (!match) return null

      const encodedValue = match.split("=")[1]
      if (!encodedValue) return null

      const value = decodeURIComponent(encodedValue)
      return JSON.parse(value) as T
    } catch {
      return null
    }
  }

  let writeTimeout: NodeJS.Timeout | null = null

  return {
    async read(key?: string): Promise<T | null> {
      const cookieKey = key ?? defaultKey
      return parseValue(cookieKey)
    },

    async write(key: string, state: T): Promise<void> {
      if (!isBrowser() || !isCookieAvailable()) {
        return
      }

      // Defer write to avoid layout thrashing
      if (writeTimeout) clearTimeout(writeTimeout)
      writeTimeout = setTimeout(() => {
        try {
          const value = encodeURIComponent(JSON.stringify(state))
          document.cookie = `${key}=${value}; max-age=${maxAge}; path=/`
        } catch {
          // Silently fail
        }
      }, 0)
    },

    async delete(key: string): Promise<void> {
      if (!isBrowser() || !isCookieAvailable()) {
        return
      }

      try {
        document.cookie = `${key}=; max-age=0; path=/`
      } catch {
        // Silently fail
      }
    },

    async clear(): Promise<void> {
      if (!isBrowser() || !isCookieAvailable()) {
        return
      }

      try {
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=")
          const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim()
          if (name) {
            document.cookie = `${name}=; max-age=0; path=/`
          }
        })
      } catch {
        // Silently fail
      }
    },

    subscribe(key: string, listener: (value: T | null) => void): () => void {
      const cookieKey = key ?? defaultKey
      let lastValue = parseValue(cookieKey)

      const pollInterval = setInterval(() => {
        const currentValue = parseValue(cookieKey)
        if (currentValue !== lastValue) {
          lastValue = currentValue
          listener(currentValue)
        }
      }, 1000)

      return () => clearInterval(pollInterval)
    },
  }
}
