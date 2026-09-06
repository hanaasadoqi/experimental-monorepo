"use client"

import { createContext, useContext, type Context, type ReactNode } from "react"
import type { StoreApi } from "zustand/vanilla"

/**
 * Bundle returned by createStoreContext containing Context, Provider, and hook.
 *
 * @template TState The shape of the Zustand store state
 * @property Context The React context (holds StoreApi<TState> | null)
 * @property Provider Component that wraps children with the store context
 * @property useStoreApi Hook that retrieves the store API (throws if not in Provider)
 */
export interface StoreContextBundle<TState> {
  Context: Context<StoreApi<TState> | null>
  Provider: (props: {
    value: StoreApi<TState>
    children: ReactNode
  }) => ReactNode
  useStoreApi: () => StoreApi<TState>
}

/**
 * Creates a React context bundle for a Zustand store.
 *
 * This factory creates a Context, Provider component, and hook that work together
 * to make a Zustand store available throughout a component tree. The hook throws
 * if called outside the provider, ensuring safe access to the store.
 *
 * @template TState The shape of the Zustand store state
 * @param name Display name for the context (used in React DevTools)
 * @returns Object containing Context, Provider component, and useStoreApi hook
 *
 * @example
 * ```tsx
 * const store = create<AuthState>((set) => ({ ... }))
 * const { Provider, useStoreApi } = createStoreContext<AuthState>("AuthStore")
 *
 * <Provider value={store}>
 *   <MyApp />
 * </Provider>
 *
 * function MyComponent() {
 *   const store = useStoreApi()
 *   const user = store.getState().user
 *   return <div>{user.name}</div>
 * }
 * ```
 *
 * Performance: Wrap the store in useMemo to avoid unnecessary re-renders:
 * ```tsx
 * const storeValue = useMemo(() => store, [])
 * <Provider value={storeValue}><Child /></Provider>
 * ```
 */
export function createStoreContext<TState>(
  name: string
): StoreContextBundle<TState> {
  const Context = createContext<StoreApi<TState> | null>(null)
  Context.displayName = name

  function Provider({
    value,
    children,
  }: {
    value: StoreApi<TState>
    children: ReactNode
  }) {
    return <Context.Provider value={value}>{children}</Context.Provider>
  }

  Provider.displayName = `${name}Provider`

  /**
   * Hook to access the Zustand store API.
   *
   * Must be called inside a component tree wrapped with the Provider. Throws
   * an error if the provider is missing.
   *
   * @returns The Zustand StoreApi for reading state and dispatching actions
   * @throws {Error} If called outside the Provider
   */
  function useStoreApi(): StoreApi<TState> {
    const store = useContext(Context)
    if (store === null) {
      throw new Error(
        `\`useStoreApi()\` must be called within a <${name}Provider>.\n` +
        `Ensure the component tree is wrapped with: <Provider value={store}>...</Provider>`
      )
    }
    return store
  }

  return { Context, Provider, useStoreApi }
}
