"use client"

import type { OklchColor } from "@repo/domain-theme"
import {
  autoForeground,
  getContrastRatio,
  getWcagLevel,
  toCss,
} from "../../utils/shade-generation"
import { cn } from "@repo/ui-components/lib/utils"

export interface ContrastIndicatorProps {
  color: OklchColor
}

export function ContrastIndicator({ color }: ContrastIndicatorProps) {
  const bestFg = autoForeground(color)
  const bestRatio = getContrastRatio(bestFg, color)
  const level = getWcagLevel(bestRatio)

  const levelColors: Record<string, string> = {
    AAA: "text-emerald-600 dark:text-emerald-400",
    AA: "text-blue-600 dark:text-blue-400",
    Fail: "text-red-500",
  }

  const colorCss = toCss(color)
  const fgCss = toCss(bestFg)

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
      <div
        className="w-10 h-10 rounded-lg border border-border shadow-sm flex items-center justify-center text-xs font-bold shrink-0"
        style={{ backgroundColor: colorCss, color: fgCss }}
      >
        Aa
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono text-muted-foreground truncate">
          {colorCss}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn("text-xs font-semibold", levelColors[level])}>
            {level}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {bestRatio.toFixed(2)}:1
          </span>
        </div>
      </div>
    </div>
  )
}
