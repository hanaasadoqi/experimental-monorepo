"use client"

import { cn } from "@repo/ui-components/lib/utils"
import { useId } from "react"

type ChannelSliderProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  gradient: string
  suffix?: string
  precision?: number
  onChange: (value: number) => void
  compact?: boolean
}

export function ChannelSlider({
  label,
  value,
  min,
  max,
  step,
  gradient,
  suffix = "",
  precision = 3,
  onChange,
  compact = false,
}: ChannelSliderProps) {
  const id = useId()

  return (
    <div className={cn("grid", compact ? "gap-1" : "gap-2")}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="text-muted-foreground text-xs font-medium tracking-[0.08em] uppercase"
        >
          {label}
        </label>
        <div className="flex items-baseline gap-1 font-mono text-sm tabular-nums">
          <input
            aria-label={`${label} value`}
            type="number"
            value={round(value, precision)}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const next = Number.parseFloat(e.target.value)
              if (!Number.isNaN(next)) onChange(clamp(next, min, max))
            }}
            className="text-foreground focus:border-foreground w-16 [appearance:textfield] border-b border-transparent bg-transparent text-right outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-muted-foreground">{suffix}</span>
        </div>
      </div>
      <div className="relative flex h-6 items-center">
        <div
          className="ring-border/70 pointer-events-none absolute inset-x-0 h-2 rounded-[3px] ring-1 ring-inset"
          style={{ background: gradient }}
        />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number.parseFloat(e.target.value))}
          className={cn(
            "relative z-10 h-6 w-full cursor-pointer appearance-none bg-transparent",
            "[&::-webkit-slider-thumb]:border-foreground [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-1.75 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-xs [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:shadow-[0_1px_2px_rgb(0_0_0/0.25)]",
            "[&::-moz-range-thumb]:border-foreground [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-1.75 [&::-moz-range-thumb]:rounded-xs [&::-moz-range-thumb]:border"
          )}
        />
      </div>
    </div>
  )
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function round(n: number, digits: number) {
  const factor = 10 ** digits
  return Math.round(n * factor) / factor
}
