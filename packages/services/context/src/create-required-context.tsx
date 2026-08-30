"use client"

import {
  createContext,
  useContext,
  type Context,
  type ReactNode,
} from "react"

import { MissingContextError } from "./missing-context-error.js"

export interface RequiredContextResult<T> {
  Context: Context<T | null>
  Provider: (props: { value: T; children: ReactNode }) => ReactNode
  useValue: () => T
}

export function createRequiredContext<T>(
  displayName: string,
): RequiredContextResult<T> {
  const Context = createContext<T | null>(null)
  Context.displayName = displayName

  function Provider({ value, children }: { value: T; children: ReactNode }): ReactNode {
    return <Context value={value}>{children}</Context>
  }

  Provider.displayName = `${displayName}Provider`

  function useValue(): T {
    const value = useContext(Context)

    if (value === null) {
      throw new MissingContextError(displayName)
    }

    return value
  }

  return { Context, Provider, useValue }
}
