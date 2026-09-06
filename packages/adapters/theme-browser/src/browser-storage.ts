/** Return browser storage at call time so React runtimes can inject it safely. */
export function getBrowserThemeStorage(): Storage | undefined {
  return typeof window === "undefined" ? undefined : window.localStorage
}
