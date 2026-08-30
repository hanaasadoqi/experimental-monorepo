function isHttps(): boolean {
  try {
    return typeof location !== "undefined" && location.protocol === "https:"
  } catch {
    return false
  }
}

// TODO: Add more robust cookie reading logic to handle edge cases, such as cookies with special characters or multiple cookies with the same name. Also, more cookies utils to handle different use cases, like, setting cookies with different attributes (e.g., SameSite, Secure, HttpOnly), syncing them, ttl, deleting cookies, etc.

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

// TODO: Consider using a more robust channel creation strategy to avoid potential conflicts with other BroadcastChannel instances.

function createChannel(name: string): BroadcastChannel | null {
  try {
    return typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel(`preferences-cookie:${name}`)
  } catch {
    return null
  }
}

export {
  createChannel,
  readCookie,
  isHttps
}

// TODO: Consider using a more robust storage access strategy to handle potential errors and edge cases, such as storage being unavailable or disabled in the user's browser. Also, consider adding support for other storage mechanisms, like sessionStorage or IndexedDB, to provide more flexibility in how preferences are persisted.

export function getStorage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage
  } catch {
    return null
  }
}
