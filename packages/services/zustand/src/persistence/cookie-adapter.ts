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
  key: string,
  options: CookieAdapterOptions = {}
): PersistenceAdapter<T> => {
  const maxAge = options.maxAge ?? 365 * 24 * 60 * 60 // 1 year

  const parseValue = (): T | undefined => {
    if (!isBrowser() || !isCookieAvailable()) {
      return undefined
    }

    try {
      const match = document.cookie
        .split("; ")
        .find((c) => c.startsWith(`${key}=`))

      if (!match) return undefined

      const encodedValue = match.split("=")[1]
      if (!encodedValue) return undefined

      const value = decodeURIComponent(encodedValue)
      return JSON.parse(value) as T
    } catch {
      return undefined
    }
  }

  let writeTimeout: NodeJS.Timeout | null = null

  return {
    read(): T | undefined {
      return parseValue()
    },

    write(state: T): void {
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

    subscribe(listener: () => void): () => void {
      let lastValue = parseValue()

      const pollInterval = setInterval(() => {
        const currentValue = parseValue()
        if (currentValue !== lastValue) {
          lastValue = currentValue
          listener()
        }
      }, 1000)

      return () => clearInterval(pollInterval)
    },
  }
}
