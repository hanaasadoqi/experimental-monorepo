"use client"

import { useEffect } from "react"

import type { ResolvedAppearancePreference } from "@repo/domain-preferences"

import { isTypingTarget } from "./is-typing-target"

export interface ThemeToggleHotkeyProps {
  resolvedAppearance: ResolvedAppearancePreference
  onAppearanceChange: (next: ResolvedAppearancePreference) => void
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
