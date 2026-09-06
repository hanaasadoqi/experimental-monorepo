"use client"
import {
  getContrastRatio,
  getWcagLevel,
  toCss,
} from "../../../../utils/shade-generation"
import { cn } from "@repo/ui-components/lib/utils"
import type { Oklch } from "@repo/domain-theme"

export type ContrastIndicatorProps = { color: Oklch }

export function ContrastIndicator({ color }: ContrastIndicatorProps) {
  const white: Oklch = { l: 0.97, c: 0, h: 0 }
  const black: Oklch = { l: 0.1, c: 0, h: 0 }
  const whiteContrast = getContrastRatio(white, color)
  const blackContrast = getContrastRatio(black, color)
  const bestFg = whiteContrast >= blackContrast ? white : black
  const bestRatio = Math.max(whiteContrast, blackContrast)
  const level = getWcagLevel(bestRatio)

  const levelColors: Record<string, string> = {
    AAA: "text-emerald-600 dark:text-emerald-400",
    AA: "text-blue-600 dark:text-blue-400",
    Fail: "text-red-500",
  }

  return (
    <div className="bg-muted/50 border-border flex items-center gap-3 rounded-lg border p-3">
      <div
        className="border-border flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-xs font-bold shadow-sm"
        style={{ backgroundColor: toCss(color), color: toCss(bestFg) }}
      >
        Aa
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground truncate font-mono text-xs">
          {toCss(color)}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className={cn("text-xs font-semibold", levelColors[level])}>
            {level}
          </span>
          <span className="text-muted-foreground font-mono text-xs">
            {bestRatio.toFixed(2)}:1
          </span>
        </div>
      </div>
    </div>
  )
}
