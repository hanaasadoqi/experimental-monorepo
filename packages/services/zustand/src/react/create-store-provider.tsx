"use. client";

import { useRef, type ReactNode } from "react"
import type { StoreApi } from "zustand/vanilla"

export interface StoreProviderFactoryOptions<TState, TOptions> {
  createStore: (options: TOptions) => StoreApi<TState>
  Provider: (props: { value: StoreApi<TState>; children: ReactNode }) => ReactNode
}

export function createStoreProvider<TState, TOptions>({
  createStore,
  Provider,
}: StoreProviderFactoryOptions<TState, TOptions>) {
  return function StoreProvider({ children, options }: { children: ReactNode; options: TOptions }) {
    const storeRef = useRef<StoreApi<TState> | null>(null)
    if (storeRef.current === null) storeRef.current = createStore(options)
    return <Provider value={storeRef.current}>{children}</Provider>
  }
}
