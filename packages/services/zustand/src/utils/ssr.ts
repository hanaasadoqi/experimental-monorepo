/// <reference types="node" />

/**
 * SSR-safe environment detection utilities.
 * Enables graceful fallbacks for storage APIs unavailable on the server.
 */

/**
 * Check if we're in a browser environment with DOM support.
 */
export const isBrowser = (): boolean => {
  return typeof window !== "undefined" && typeof document !== "undefined"
}

/**
 * Check if localStorage is available and accessible.
 * May fail in some cases (incognito mode, privacy mode, quota exceeded).
 */
export const isLocalStorageAvailable = (): boolean => {
  if (!isBrowser()) return false

  try {
    const testKey = "__zustand_test__"
    localStorage.setItem(testKey, "test")
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Check if sessionStorage is available and accessible.
 */
export const isSessionStorageAvailable = (): boolean => {
  if (!isBrowser()) return false

  try {
    const testKey = "__zustand_test__"
    sessionStorage.setItem(testKey, "test")
    sessionStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Check if document.cookie is available (excludes some CORS scenarios).
 */
export const isCookieAvailable = (): boolean => {
  if (!isBrowser()) return false

  try {
    // Try to access document.cookie
    return document.cookie !== undefined
  } catch {
    return false
  }
}

/**
 * Safe wrapper for localStorage access.
 * Returns undefined if not available.
 */
export const safeLocalStorage = (): Storage | undefined => {
  if (isLocalStorageAvailable()) {
    return localStorage
  }
  return undefined
}

/**
 * Safe wrapper for sessionStorage access.
 * Returns undefined if not available.
 */
export const safeSessionStorage = (): Storage | undefined => {
  if (isSessionStorageAvailable()) {
    return sessionStorage
  }
  return undefined
}

/**
 * Get the current environment type.
 */
export type Environment = "browser" | "ssr" | "node"

export const getEnvironment = (): Environment => {
  if (typeof window !== "undefined") {
    return "browser"
  }
  if (typeof global !== "undefined" && typeof process !== "undefined") {
    return "node"
  }
  return "ssr"
}
