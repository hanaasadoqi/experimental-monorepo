"use client"

import * as React from "react"
import { useTheme } from "../hooks"
import { isTypingTarget } from "../utils/is-typing-target"

export function ThemeToggleHotkey() {
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

      const newTheme = isDark ? "light" : "dark";
      setTheme(newTheme);
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [isDark, setTheme])

  return null
}
