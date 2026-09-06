"use client"

import { createContext, useContext, type Context, type ReactNode } from "react"

export interface OptionalContextResult<T> {
  Context: Context<T | null>
  Provider: (props: { value: T; children: ReactNode }) => ReactNode
  /**
   * Hook to consume the optional context value.
   *
   * Returns the context value or null if not provided by a Provider.
   *
   * IMPORTANT: Use strict null checking (`value === null`) to determine if the
   * provider exists. Do NOT use truthiness checks (`if (value)`) because falsy
   * T values (false, 0, empty string) are valid values distinct from null.
   *
   * @example
   * ```tsx
   * const value = useOptionalValue()
   * if (value === null) {
   *   return <div>Provider not found</div>
   * }
   * // value is now safely T (not null)
   * ```
   */
  useOptionalValue: () => T | null
}

/**
 * Creates an optional context with a Provider and hook.
 *
 * Use this when a feature is optional and consumers should handle the absence
 * of a provider gracefully (returning null instead of throwing).
 *
 * @param displayName - Used for React DevTools debugging
 * @returns Object with Context, Provider component, and useOptionalValue hook
 *
 * @example
 * ```tsx
 * const { Provider, useOptionalValue } = createOptionalContext<User>("UserContext")
 *
 * function Child() {
 *   const user = useOptionalValue()
 *   if (user === null) return <div>No user</div>
 *   return <div>{user.name}</div>
 * }
 * ```
 *
 * Performance tip: Memoize the value object passed to Provider to prevent
 * unnecessary re-renders of consumers:
 * ```tsx
 * const value = useMemo(() => ({ /data/ }), [dependencies])
 * <Provider value={value}><Child /></Provider>
 * ```
 */
export function createOptionalContext<T>(
  displayName: string
): OptionalContextResult<T> {
  const Context = createContext<T | null>(null)
  Context.displayName = displayName

  function Provider({
    value,
    children,
  }: {
    value: T
    children: ReactNode
  }): ReactNode {
    return <Context.Provider value={value}>{children}</Context.Provider>
  }

  Provider.displayName = `${displayName}Provider`

  function useOptionalValue(): T | null {
    return useContext(Context)
  }

  return { Context, Provider, useOptionalValue }
}
