"use client"

import {
  createContext as createReactContext,
  ReactNode,
  useContext,
  useRef,
} from "react"
import type { Store } from "@repo/services-zustand"

import type { ContextProviderProps } from "../types"

interface CreateStoreProviderResult<T> {
  Provider: (props: ContextProviderProps & { children: ReactNode }) => ReactNode
  useStore: () => Store<T>
}

/**
 * Create a provider for injecting a Zustand store into React Context.
 * Each provider instance creates an isolated store instance.
 * @param storeFactory Function that creates a new store instance
 * @param displayName Name for debugging
 */
export const createStoreProvider = <T,>(
  storeFactory: () => Store<T>,
  displayName: string
): CreateStoreProviderResult<T> => {
  const Context = createReactContext<Store<T> | undefined>(undefined)
  Context.displayName = displayName

  const useStoreHook = (): Store<T> => {
    const store = useContext(Context)

    if (store === undefined) {
      const error = new Error(
        `${displayName} store not found. Make sure to wrap your component with ${displayName}Provider.`
      )
      error.name = "ContextError"
      throw error
    }

    return store
  }

  const Provider = (
    props: ContextProviderProps & { children: ReactNode }
  ): ReactNode => {
    const storeRef = useRef<Store<T> | null>(null)

    // Create store instance once per provider
    if (storeRef.current === null) {
      storeRef.current = storeFactory()
    }

    return (
      <Context.Provider value={storeRef.current}>
        {props.children}
      </Context.Provider>
    )
  }

  Provider.displayName = `${displayName}Provider`

  return {
    Provider,
    useStore: useStoreHook,
  }
}
