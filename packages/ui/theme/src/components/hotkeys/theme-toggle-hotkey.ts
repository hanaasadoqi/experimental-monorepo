"use client"

import { useEffect } from "react"

import type { ThemeMode } from "@repo/domain-theme/appearance"

import { isTypingTarget } from "./is-typing-target"

export interface ThemeToggleHotkeyProps {
  resolvedAppearance: ThemeMode
  onAppearanceChange: (next: ThemeMode) => void
}

export function ThemeToggleHotkey({
  resolvedAppearance,
  onAppearanceChange,
}: ThemeToggleHotkeyProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      onAppearanceChange(resolvedAppearance === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedAppearance, onAppearanceChange])

  return null
}
