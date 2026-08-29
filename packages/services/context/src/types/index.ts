import type { ReactNode } from "react"

export interface ContextProviderProps {
  children: ReactNode
}

export interface UseContextError extends Error {
  name: "ContextError"
}
