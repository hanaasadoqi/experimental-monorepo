"use client"

import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@repo/ui-components/lib/utils"

type ColorSwatchTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  hex: string
  css: string
}

/** Reusable trigger button (swatch + values) for opening a picker in a popover, sheet, or dialog. */
export const ColorSwatchTrigger = forwardRef<
  HTMLButtonElement,
  ColorSwatchTriggerProps
>(({ hex, css, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "border-border/70 hover:border-foreground/40 focus-visible:ring-foreground/40 flex items-center gap-3 rounded-md border p-2.5 text-left transition-colors outline-none focus-visible:ring-2",
        className
      )}
      {...props}
    >
      <span
        className="border-border/70 size-8 shrink-0 rounded-sm border"
        style={{ backgroundColor: hex }}
        aria-hidden
      />
      <span className="grid min-w-0 gap-0.5">
        <span className="block truncate font-mono text-xs tabular-nums">
          {css}
        </span>
        <span className="text-muted-foreground block truncate font-mono text-xs tabular-nums">
          {hex}
        </span>
      </span>
    </button>
  )
})
ColorSwatchTrigger.displayName = "ColorSwatchTrigger"
