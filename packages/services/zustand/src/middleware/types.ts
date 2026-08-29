import type { StateCreator } from "zustand"

/**
 * Zustand middleware type.
 * Takes a StateCreator and returns an enhanced StateCreator.
 */
export type Middleware<T> = (next: StateCreator<T, []>) => StateCreator<T, []>

/**
 * Configuration for middleware composition.
 */
export interface MiddlewareConfig {
  enabled?: boolean
  name?: string
}

/**
 * Compose multiple middleware into a single middleware.
 * Middleware are applied right-to-left.
 *
 * @example
 * const combined = composeMiddleware(
 *   persistMiddleware(adapter),
 *   loggerMiddleware(),
 * )
 *
 * const store = createStore(combined(initialState))
 */
export const composeMiddleware = <T>(
  ...middlewares: Middleware<T>[]
): Middleware<T> => {
  return (next: StateCreator<T, []>) => {
    let enhancedNext = next
    for (const middleware of middlewares) {
      enhancedNext = middleware(enhancedNext)
    }
    return enhancedNext
  }
}

/**
 * Higher-order function to conditionally apply middleware.
 */
export const withCondition = <T>(
  condition: boolean | (() => boolean),
  middleware: Middleware<T>
): Middleware<T> => {
  return (next: StateCreator<T, []>) => {
    const shouldApply =
      typeof condition === "function" ? condition() : condition

    if (!shouldApply) {
      return next
    }

    return middleware(next)
  }
}
