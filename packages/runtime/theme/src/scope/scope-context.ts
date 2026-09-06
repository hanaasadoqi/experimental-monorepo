import { createContext } from "react"
import type { ScopeStoreApi } from "./scope-store"

/**
 * React context for scoped theme store.
 * Provides the Zustand store to consuming components via useThemeScope hook.
 */
export const ScopeContext = createContext<ScopeStoreApi | undefined>(undefined)
ScopeContext.displayName = "ScopeContext"
