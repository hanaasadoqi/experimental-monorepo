"use client"

import { createContext, useContext, type Context, type ReactNode } from "react"
import type { StoreApi } from "zustand/vanilla"

export interface StoreContextBundle<TState> {
  Context: Context<StoreApi<TState> | null>
  Provider: (props: {
    value: StoreApi<TState>
    children: ReactNode
  }) => ReactNode
  useStoreApi: () => StoreApi<TState>
}

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
    return <Context value={value}>{children}</Context>
  }

  function useStoreApi(): StoreApi<TState> {
    const store = useContext(Context)
    if (!store) throw new Error(`${name} provider is missing`)
    return store
  }

  return { Context, Provider, useStoreApi }
}
