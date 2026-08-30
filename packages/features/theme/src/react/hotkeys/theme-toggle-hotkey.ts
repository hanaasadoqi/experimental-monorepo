"use client"

import { useEffect } from "react"

import {
  useSetAppearancePreference,
} from "@repo/feature-preferences"

import {
  useResolvedAppearance,
} from "../appearance"

import {
  isTypingTarget,
} from "./is-typing-target"

export function ThemeToggleHotkey() {
  const resolvedAppearance =
    useResolvedAppearance()

  const setAppearance =
    useSetAppearancePreference()

  useEffect(() => {
    function onKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return
      }

      if (
        event.key.toLowerCase() !== "d"
      ) {
        return
      }

      if (
        isTypingTarget(event.target)
      ) {
        return
      }

      setAppearance(
        resolvedAppearance === "dark"
          ? "light"
          : "dark",
      )
    }

    window.addEventListener(
      "keydown",
      onKeyDown,
    )

    return () => {
      window.removeEventListener(
        "keydown",
        onKeyDown,
      )
    }
  }, [
    resolvedAppearance,
    setAppearance,
  ])

  return null
}
