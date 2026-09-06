"use client"

import { createContext, useContext, type Context, type ReactNode } from "react"

import { MissingContextError } from "./missing-context-error.js"

export interface RequiredContextResult<T> {
  Context: Context<T | null>
  Provider: (props: { value: T; children: ReactNode }) => ReactNode
  /**
   * Hook to consume the required context value.
   *
   * Returns the context value if the component is within a Provider.
   * Throws MissingContextError if the provider is not found.
   *
   * Use this when a context is mandatory and missing it indicates a setup error.
   *
   * @throws {MissingContextError} If called outside of the Provider
   *
   * @example
   * ```tsx
   * const value = useRequiredValue() // value is safely T (not null)
   * return <div>{value.name}</div>
   * ```
   */
  useRequiredValue: () => T
}

/**
 * Creates a required context with a Provider and hook.
 *
 * Use this when a feature depends on context being available. If the Provider
 * is missing, it throws an error rather than returning null.
 *
 * @param displayName - Used for React DevTools debugging and error messages
 * @returns Object with Context, Provider component, and useRequiredValue hook
 *
 * @example
 * ```tsx
 * const { Provider, useRequiredValue } = createRequiredContext<Theme>("ThemeContext")
 *
 * function Child() {
 *   const theme = useRequiredValue() // Throws if not in Provider
 *   return <div className={theme.mode}></div>
 * }
 * ```
 *
 * Performance tip: Memoize the value object passed to Provider to prevent
 * unnecessary re-renders of consumers:
 * ```tsx
 * const value = useMemo(() => ({ data }), [dependencies])
 * <Provider value={value}><Child /></Provider>
  * ```
 */
export function createRequiredContext<T>(
  displayName: string
): RequiredContextResult<T> {
  const Context = createContext<T | null>(null)
  Context.displayName = displayName

  function Provider({
    value,
    children,
  }: {
    value: T
    children: ReactNode
  }): ReactNode {
    return (
      <Context.Provider value={value}>{children}</Context.Provider>
    )
  }

  Provider.displayName = `${displayName}Provider`

  function useRequiredValue(): T {
    const value = useContext(Context)

    if (value === null) {
      throw new MissingContextError(displayName)
    }

    return value
  }

  return { Context, Provider, useRequiredValue }
}
