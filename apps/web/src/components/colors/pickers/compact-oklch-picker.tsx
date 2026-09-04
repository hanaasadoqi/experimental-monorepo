"use client"

import { clampH } from "@repo/domain-theme"
import { Button } from "@repo/ui-components/base"
import {
  DEFAULT_OKLCH_COLOR,
  UseOklchColorReturn,
  buildChannelGradient,
  useOklchColor,
} from "@repo/ui-theme"
import { Oklch } from "culori"
import { Dices } from "lucide-react"
import { ChannelSlider } from "../channel-slider"
import { CopyButton } from "../../copy-value"
import { SpectrumPicker } from "./spectrum-picker"

type CompactOklchPickerProps = {
  defaultColor?: Oklch
  className?: string
  /** Pass a hook instance created elsewhere to keep an external trigger/preview in sync with this picker. */
  colorState?: UseOklchColorReturn
}

/**
 * Dense variant of the picker for tight containers (popovers, tabs).
 * Trades the full shade grid for a single scrollable strip and drops the
 * oklch() text field, keeping only the spectrum, sliders, and hex input.
 */
export function CompactOklchPicker({
  defaultColor = DEFAULT_OKLCH_COLOR,
  className,
  colorState,
}: CompactOklchPickerProps) {
  const ownState = useOklchColor(defaultColor)
  const {
    color,
    setColor,
    hex,
    css,
    shades,
    hexText,
    setHexText,
    hexFocused: hexFocusedRef,
    commitHex,
    randomize,
  } = colorState ?? ownState

  return (
    <div className={className ?? "grid w-72 gap-4"}>
      <div className="flex items-center gap-3">
        <div
          className="border-border/70 size-10 shrink-0 rounded-sm border"
          style={{ backgroundColor: hex }}
          aria-hidden
        />
        <div className="grid min-w-0 gap-0.5">
          <CopyButton value={css} label="OKLCH value" className="min-w-0">
            <span className="block truncate font-mono text-xs tabular-nums">
              {css}
            </span>
          </CopyButton>
          <CopyButton value={hex} label="hex value" className="min-w-0">
            <span className="text-muted-foreground block truncate font-mono text-xs tabular-nums">
              {hex}
            </span>
          </CopyButton>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={randomize}
          className="ml-auto size-7 shrink-0"
          aria-label="Randomize color"
        >
          <Dices className="size-3.5" aria-hidden />
        </Button>
      </div>

      <SpectrumPicker
        l={color.l}
        c={color.c}
        h={color.h}
        onChange={(l, c) => setColor((prev) => ({ ...prev, l, c }))}
      />

      <div className="grid gap-3">
        <ChannelSlider
          label="L"
          value={color.l}
          min={0}
          max={1}
          step={0.001}
          precision={2}
          gradient={buildChannelGradient("l", color)}
          onChange={(l) => setColor((prev) => ({ ...prev, l }))}
        />
        <ChannelSlider
          label="C"
          value={color.c}
          min={0}
          max={0.4}
          step={0.001}
          precision={2}
          gradient={buildChannelGradient("c", color)}
          onChange={(c) => setColor((prev) => ({ ...prev, c }))}
        />
        <ChannelSlider
          label="H"
          value={color.h}
          min={0}
          max={360}
          step={0.1}
          precision={0}
          suffix="°"
          gradient={buildChannelGradient("h", color)}
          onChange={(h) => setColor((prev) => ({ ...prev, h: clampH(h) }))}
        />
      </div>

      <label className="grid gap-1.5">
        <span className="text-muted-foreground text-xs font-medium tracking-[0.08em] uppercase">
          Hex
        </span>
        <input
          value={hexText}
          onFocus={() => {
            hexFocusedRef.current = true
          }}
          onChange={(e) => setHexText(e.target.value)}
          onBlur={() => {
            hexFocusedRef.current = false
            commitHex()
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur()
          }}
          className="border-border focus:border-foreground rounded-sm border bg-transparent px-2 py-1.5 font-mono text-sm outline-none"
          spellCheck={false}
        />
      </label>

      <div className="grid gap-1.5">
        <span className="text-muted-foreground text-xs font-medium tracking-[0.08em] uppercase">
          Shades
        </span>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {shades.map((shade) => (
            <CopyButton
              key={shade.step}
              value={shade.css}
              label={`shade ${shade.step}`}
              title={shade.css}
              className={`focus-visible:ring-foreground/40 size-7 shrink-0 rounded-xs border outline-none focus-visible:ring-2 ${
                shade.isBase
                  ? "border-foreground ring-foreground/60 ring-1"
                  : "border-border/60"
              }`}
            >
              <span className="sr-only">{`Shade ${shade.step}, ${shade.hex}`}</span>
              <span
                aria-hidden
                className="block size-full rounded-[1px]"
                style={{ backgroundColor: shade.hex }}
              />
            </CopyButton>
          ))}
        </div>
      </div>
    </div>
  )
}
