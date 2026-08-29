import {
  createContext as createReactContext,
  ReactNode,
  useContext,
} from "react"

import type { ContextProviderProps, UseContextError } from "../types"

interface CreateContextResult<T> {
  Provider: (props: ContextProviderProps & { value: T }) => ReactNode
  useContext: () => T
}

export const createContext = <T,>(
  displayName: string
): CreateContextResult<T> => {
  const Context = createReactContext<T | undefined>(undefined)
  Context.displayName = displayName

  const useContextHook = (): T => {
    const context = useContext(Context)

    if (context === undefined) {
      const error: UseContextError = new Error(
        `${displayName} context not found. Make sure to wrap your component with ${displayName}Provider.`
      ) as UseContextError
      error.name = "ContextError"
      throw error
    }

    return context
  }

  const Provider = (props: ContextProviderProps & { value: T }): ReactNode => {
    return (
      <Context.Provider value={props.value}>{props.children}</Context.Provider>
    )
  }

  Provider.displayName = `${displayName}Provider`

  return {
    Provider,
    useContext: useContextHook,
  }
}
