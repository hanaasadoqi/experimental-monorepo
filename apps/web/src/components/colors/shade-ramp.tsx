"use client"

import { Shade } from "@repo/domain-theme"
import { cn } from "@repo/ui-components/lib/index"
import { CopyButton } from "../copy-value"

type ShadeRampProps = {
  shades: Shade[]
}

export function ShadeRamp({ shades }: ShadeRampProps) {
  return (
    <div className="grid gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-muted-foreground text-xs font-medium tracking-[0.08em] uppercase">
          Generated shades
        </h2>
        <p className="text-muted-foreground text-xs">
          Click a swatch to copy its OKLCH value
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2 @sm:grid-cols-6 @2xl:grid-cols-11">
        {shades.map((shade) => (
          <div
            key={shade.step}
            className={cn(
              "border-border/70 relative grid h-20 cursor-pointer items-center justify-center gap-1 rounded-sm border text-center text-xs font-medium tracking-[0.08em] transition hover:opacity-70 active:opacity-50",
              "focus-visible:ring-ring focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:outline-1"
            )}
          >
            <CopyButton
              value={shade.hex}
              label={`Copied ${shade.hex} to clipboard`}
              className="border-border/70 focus-visible:ring-ring focus-visible:outline-ring absolute inset-0 z-10 grid h-full w-full cursor-pointer items-center justify-center rounded-sm border text-center text-xs font-medium tracking-[0.08em] transition hover:opacity-70 focus-visible:ring-[3px] focus-visible:outline-1 active:opacity-50"
            >
              <span className="font-mono text-[10px] tabular-nums">
                {shade.hex}
              </span>
            </CopyButton>
            <span
              aria-hidden
              className="absolute inset-0 rounded-[3px]"
              style={{ backgroundColor: shade.hex }}
            />
            <span
              className="relative z-10 font-mono text-[10px] tabular-nums"
              style={{ color: textColorFor(shade) }}
            >
              {shade.step}
            </span>
            <span
              className="relative z-10 truncate font-mono text-[10px] tabular-nums opacity-80"
              style={{ color: textColorFor(shade) }}
            >
              {shade.hex}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function textColorFor(shade: Shade) {
  return shade.l > 0.55 ? "oklch(0.18 0 0)" : "oklch(0.96 0 0)"
}

const CopyClipboard = ({ value }: { value: string }) => {
  return (
    <CopyButton
      value={value}
      label={`Copied ${value} to clipboard`}
      className="border-border/70 focus-visible:ring-ring focus-visible:outline-ring absolute inset-0 z-10 grid h-full w-full cursor-pointer items-center justify-center rounded-sm border text-center text-xs font-medium tracking-[0.08em] transition hover:opacity-70 focus-visible:ring-[3px] focus-visible:outline-1 active:opacity-50"
    >
      <span className="font-mono text-[10px] tabular-nums">{value}</span>
    </CopyButton>
  )
}
