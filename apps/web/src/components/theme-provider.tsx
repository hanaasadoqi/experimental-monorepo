"use client"

import * as React from "react"
import { ThemeProvider as FeatureThemeProvider } from "@repo/feature-theme"
import { useTheme } from "@repo/feature-theme"

interface ThemeProviderProps {
  children: React.ReactNode
}

function ThemeToggleHotkey() {
  const { setTheme, isDark } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(isDark ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [isDark, setTheme])

  return null
}

function isTypingTarget(target: EventTarget | null, tagNames: string[] = []) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const defaultTagNames = ["INPUT", "TEXTAREA", "SELECT"]
  const normalizedTagNames = tagNames?.map((tag) => tag.toUpperCase())
  const finalTagNames = Array.from(
    new Set([...defaultTagNames, ...normalizedTagNames])
  )

  return finalTagNames.includes(target.tagName) || target.isContentEditable
}

function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <FeatureThemeProvider defaultTheme="system">
      <ThemeToggleHotkey />
      {children}
    </FeatureThemeProvider>
  )
}

export { ThemeProvider }
