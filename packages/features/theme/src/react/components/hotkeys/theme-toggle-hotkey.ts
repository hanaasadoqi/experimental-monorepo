"use client"

import { useEffect, useState } from "react"

// import { useSetAppearancePreference } from "@repo/features-preferences"

import { isTypingTarget } from "./is-typing-target"
import { useResolvedAppearance } from "../../../domain/core/appearance";
// import { useResolvedAppearance } from "../../../domain";

export function ThemeToggleHotkey() {
  const resolvedAppearance = useResolvedAppearance()
  const [_, setAppearance] = useState(resolvedAppearance)

  // const setAppearance = useSetAppearancePreference()

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

      setAppearance(resolvedAppearance === "dark" ? "light" : "dark")

    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedAppearance, setAppearance])

  return null
}
