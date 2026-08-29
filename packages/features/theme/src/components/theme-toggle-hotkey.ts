"use client"

import * as React from "react"
import { useResolvedColorScheme, useSetAppearancePreference } from "../hooks"
import { isTypingTarget } from "../utils/is-typing-target"

export function ThemeToggleHotkey() {
  const resolvedColorScheme = useResolvedColorScheme()
  const setPreference = useSetAppearancePreference()

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

      const newPreference = resolvedColorScheme === "dark" ? "light" : "dark"
      setPreference(newPreference)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedColorScheme, setPreference])

  return null
}
