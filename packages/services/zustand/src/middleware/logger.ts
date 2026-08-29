import type { Middleware } from "./types.ts"

export interface LoggerMiddlewareOptions {
  /**
   * Prefix for log messages. Defaults to "Store".
   */
  prefix?: string

  /**
   * Whether to log state after each update.
   * Defaults to true.
   */
  logState?: boolean

  /**
   * Whether to log the diff between old and new state.
   * Defaults to false (requires more computation).
   */
  logDiff?: boolean

  /**
   * Whether to use console.groupCollapsed for better formatting.
   * Defaults to true.
   */
  useGrouping?: boolean

  /**
   * Filter function to exclude certain updates from logging.
   * Useful for filtering high-frequency updates or sensitive data.
   */
  filter?: (update: unknown, currentState: unknown) => boolean
}

/**
 * Logger middleware for Zustand.
 * Logs all state updates to the console with optional diffs.
 *
 * @example
 * ```typescript
 * const useStore = create<State>(
 *   loggerMiddleware({ prefix: "MyStore", logDiff: true })(
 *     (set) => ({ ... })
 *   )
 * )
 * ```
 */
export const loggerMiddleware = <T>(
  options: LoggerMiddlewareOptions = {}
): Middleware<T> => {
  const {
    prefix = "Store",
    logState = true,
    logDiff = false,
    useGrouping = true,
    filter,
  } = options

  return (next) => {
    return (set, get, api) => {
      return next(
        (update: Partial<T> | ((state: T) => Partial<T>)) => {
          const prevState = get()
          const nextState =
            typeof update === "function" ? update(prevState) : update

          // Apply filter if provided
          if (filter && !filter(update, prevState)) {
            set(update)
            return
          }

          // eslint-disable-next-line no-console
          const logFn = useGrouping ? console.groupCollapsed : console.log

          const timestamp = new Date().toISOString()
          const updateType =
            typeof update === "function" ? "function" : "object"

          logFn(`${prefix} [${timestamp}] (${updateType})`)

          if (logDiff) {
            const diff: Record<string, { old: unknown; new: unknown }> = {}
            const merged = { ...prevState, ...nextState }

            for (const key in merged) {
              if (prevState[key as keyof T] !== merged[key as keyof T]) {
                diff[key] = {
                  old: prevState[key as keyof T],
                  new: merged[key as keyof T],
                }
              }
            }

            if (Object.keys(diff).length > 0) {
              // eslint-disable-next-line no-console
              console.log("Changes:", diff)
            } else {
              // eslint-disable-next-line no-console
              console.log("No changes")
            }
          }

          if (logState) {
            // eslint-disable-next-line no-console
            console.log("Previous State:", prevState)
            // eslint-disable-next-line no-console
            console.log(
              "Update:",
              typeof update === "function" ? "[function]" : update
            )
            const merged = { ...prevState, ...nextState }
            // eslint-disable-next-line no-console
            console.log("New State:", merged)
          }

          if (useGrouping) {
            // eslint-disable-next-line no-console
            console.groupEnd()
          }

          set(update)
        },
        get,
        api
      )
    }
  }
}

/**
 * Creates a logger middleware that only logs in development.
 */
export const devLoggerMiddleware = <T>(
  options: LoggerMiddlewareOptions = {}
): Middleware<T> => {
  const isDev =
    typeof process !== "undefined" && process.env.NODE_ENV === "development"

  if (!isDev) {
    return (next) => next
  }

  return loggerMiddleware(options)
}
