"use client"

import {
  createContext,
  useContext,
  type Context,
  type ReactNode,
} from "react"

export interface OptionalContextResult<T> {
  Context: Context<T | null>
  Provider: (props: { value: T; children: ReactNode }) => ReactNode
  useValue: () => T | null
}

export function createOptionalContext<T>(
  displayName: string,
): OptionalContextResult<T> {
  const Context = createContext<T | null>(null)
  Context.displayName = displayName

  function Provider({ value, children }: { value: T; children: ReactNode }): ReactNode {
    return <Context value={value}>{children}</Context>
  }

  Provider.displayName = `${displayName}Provider`

  function useValue(): T | null {
    return useContext(Context)
  }

  return { Context, Provider, useValue }
}
