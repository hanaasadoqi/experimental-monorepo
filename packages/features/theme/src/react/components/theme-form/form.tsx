"use client"

import ModeToggle from "./mode-toggle"
import PrimaryColorField from "./primary-color-field"
import { FontSelect } from "../font/font-select"
import { useThemeFormStore } from "../../stores"

const ThemeDebug = () => {
  const value = useThemeFormStore((s) => s.value)

  return (
    <pre
      style={{
        background: "#111",
        color: "#0f0",
        padding: 12,
        fontSize: 12,
        borderRadius: 6,
        overflow: "auto",
      }}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  )
}

export function ThemeForm() {
  return (
    <div className="size-full padding-16 box-border border-right border-color-surface-200">
      <div className="my-8">
        <ThemeDebug />
      </div>
      <div style={{ display: "grid", gap: 16 }}>
        <div className="flex items-center justify-between gap-8">
          <PrimaryColorField />
          <ModeToggle />
        </div>
        <FontSelect type="body" />
        <FontSelect type="heading" />
      </div>
    </div>
  )
}
