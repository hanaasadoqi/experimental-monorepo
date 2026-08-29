"use client"

import * as React from "react"
import { AppearanceProvider } from "../provider/appearance-provider"
import { useResolvedColorScheme } from "../hooks/use-appearance"
import { ThemeToggleHotkey } from "./theme-toggle-hotkey"
import { createCookieAppearanceAdapter } from "../persistence/cookie-adapter"
import { createLocalStorageAppearanceAdapter } from "../persistence/local-storage-adapter"
import type { AppearancePreference } from "../types"

interface ThemeWrapperProps {
  children: React.ReactNode
  /**
   * Initial preference read from server. If provided, uses cookie adapter
   * instead of localStorage for cross-request persistence.
   */
  initialPreference?: AppearancePreference
  /**
   * Bootstrap script HTML to inject for flash-free rendering.
   */
  bootstrapScript?: string
  /**
   * Use localStorage adapter instead of cookies. Defaults to false.
   */
  useLocalStorage?: boolean
}

function ThemeWrapperContent({ children }: ThemeWrapperProps) {
  const resolvedColorScheme = useResolvedColorScheme()

  React.useEffect(() => {
    if (resolvedColorScheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [resolvedColorScheme])

  return (
    <>
      <ThemeToggleHotkey />
      {children}
    </>
  )
}

function ThemeWrapper({
  children,
  initialPreference,
  bootstrapScript,
  useLocalStorage = false,
}: ThemeWrapperProps) {
  const adapter = React.useMemo(() => {
    if (useLocalStorage) {
      return createLocalStorageAppearanceAdapter()
    }
    return createCookieAppearanceAdapter()
  }, [useLocalStorage])

  return (
    <>
      {bootstrapScript ? (
        <div dangerouslySetInnerHTML={{ __html: bootstrapScript }} />
      ) : null}
      <AppearanceProvider
        adapter={adapter}
        initialPreference={initialPreference}
        defaultPreference="system"
      >
        <ThemeWrapperContent>{children}</ThemeWrapperContent>
      </AppearanceProvider>
    </>
  )
}

export { ThemeWrapper, type ThemeWrapperProps }
