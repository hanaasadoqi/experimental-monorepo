"use client"

import { useRef, useState, type ReactNode } from "react"

import type { Preferences } from "@repo/domain-preferences"

import { createPreferencesStore, type PreferencesStoreApi } from "../store"

import { PreferencesStoreContextProvider } from "./preferences-context"

export interface PreferencesProviderProps {
  children: ReactNode
  initialPreferences?: Partial<Preferences>
}

/**
 * Error boundary fallback component for preferences initialization failures.
 */
function PreferencesErrorFallback({ error }: { error: Error }) {
  return (
    <div style={{ padding: "1rem", color: "#d32f2f" }}>
      <h2>Preferences Initialization Error</h2>
      <p>Failed to initialize preferences system.</p>
      <details style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
        <summary>Error details</summary>
        <pre style={{ overflow: "auto", marginTop: "0.5rem" }}>
          {error.message}
        </pre>
      </details>
      <p>Please try refreshing the page.</p>
    </div>
  )
}

export function PreferencesProvider({
  children,
  initialPreferences,
}: PreferencesProviderProps) {
  const storeRef = useRef<PreferencesStoreApi | null>(null)
  const [error, setError] = useState<Error | null>(null)

  // H2 FIX: Wrap store creation in try-catch to handle errors gracefully
  if (storeRef.current === null && !error) {
    try {
      storeRef.current = createPreferencesStore({
        initialState: initialPreferences,
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      console.error("PreferencesProvider initialization error:", error)
    }
  }

  // H2 FIX: Render error boundary if initialization failed
  if (error) {
    return <PreferencesErrorFallback error={error} />
  }

  // Fallback to ensure we always have a store
  if (storeRef.current === null) {
    return (
      <PreferencesErrorFallback
        error={new Error("Store failed to initialize")}
      />
    )
  }

  return (
    <PreferencesStoreContextProvider value={storeRef.current}>
      {children}
    </PreferencesStoreContextProvider>
  )
}
