"use client"

import { useState } from "react"
import { ScaleControls } from "./scale-controls"

export function TypographyScale() {
  const [fontStep, setFontStep] = useState(0)

  const sizes = [
    { name: "xs", size: "var(--text-size-xs)", range: "12-13px" },
    { name: "sm", size: "var(--text-size-sm)", range: "14-15px" },
    { name: "base", size: "var(--text-size-base)", range: "16-17px" },
    { name: "lg", size: "var(--text-size-lg)", range: "18-19px" },
    { name: "xl", size: "var(--text-size-xl)", range: "20-21px" },
    { name: "2xl", size: "var(--text-size-2xl)", range: "24-26px" },
    { name: "3xl", size: "var(--text-size-3xl)", range: "30-33px" },
    { name: "4xl", size: "var(--text-size-4xl)", range: "36-40px" },
    { name: "5xl", size: "var(--text-size-5xl)", range: "48-54px" },
    { name: "6xl", size: "var(--text-size-6xl)", range: "60-68px" },
  ]

  const handleFontSizeChange = (step: number) => {
    setFontStep(step)
    document.documentElement.style.setProperty(
      "--text-size-step",
      step.toString()
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-(--muted)/30 p-4 rounded-lg border border-(--border)">
        <p className="text-sm text-(--muted-foreground) mb-4">
          <strong>Fluid Typography: </strong> Sizes automatically scale between
          the min and max range based on viewport width. Use the controls below
          to adjust all font sizes simultaneously.
        </p>
        <ScaleControls
          fontStep={fontStep}
          onFontStepChange={handleFontSizeChange}
        />
      </div>
      {sizes.map(({ name, size, range }) => (
        <div
          key={name}
          className="flex items-baseline gap-4 border-b border-(--border) pb-4"
        >
          <div className="w-20 text-sm text-(--muted-foreground) font-mono">
            {name}
          </div>
          <div className="w-24 text-xs text-(--muted-foreground)">{range}</div>
          <div style={{ fontSize: size, lineHeight: 1 }}>
            The quick brown fox jumps
          </div>
        </div>
      ))}
    </div>
  )
}
