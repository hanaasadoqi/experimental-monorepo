"use client"

import { useThemeFormStore } from "../../stores"

type Props = {
  type: "body" | "heading"
}

export function FontSelect({ type }: Props) {
  const valueType = type === "body" ? "bodyFont" : "headingFont"

  const value = useThemeFormStore((s) => s.value[valueType])
  const setFont = useThemeFormStore((s) =>
    type === "body" ? s.setBodyFont : s.setHeadingFont
  )

  return (
    <select value={value} onChange={(e) => setFont(e.target.value)}>
      <option value="Inter">Inter</option>
      <option value="Roboto">Roboto</option>
      <option value="IBM Plex Sans">IBM Plex Sans</option>
    </select>
  )
}
