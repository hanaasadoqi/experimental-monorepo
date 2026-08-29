"use client"

import * as React from "react"
import { AppearanceProvider } from "../provider/appearance-provider"
import { useResolvedColorScheme } from "../hooks/use-appearance"
import { ThemeToggleHotkey } from "./theme-toggle-hotkey"
import { createLocalStorageAppearanceAdapter } from "../persistence/local-storage-adapter"

interface ThemeWrapperProps {
  children: React.ReactNode
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

function ThemeWrapper({ children }: ThemeWrapperProps) {
  const adapter = React.useMemo(
    () => createLocalStorageAppearanceAdapter(),
    []
  )

  return (
    <AppearanceProvider adapter={adapter} defaultPreference="system">
      <ThemeWrapperContent>{children}</ThemeWrapperContent>
    </AppearanceProvider>
  )
}

export { ThemeWrapper, type ThemeWrapperProps }
