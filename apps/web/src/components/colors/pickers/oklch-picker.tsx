"use client"

import { Dices, TriangleAlert } from "lucide-react"
import { clampH, type Oklch } from "@repo/domain-theme"
import {
  DEFAULT_OKLCH_COLOR,
  useOklchColor,
  type UseOklchColorReturn,
  buildChannelGradient,
} from "@repo/ui-theme"
import { ChannelSlider } from "../channel-slider"
import { CopyButton } from "../../copy-value"
import { ShadeRamp } from "../shade-ramp"
import { SpectrumPicker } from "./spectrum-picker"
import { Button } from "@repo/ui-components/base/button"
import { cn } from "@repo/ui-components/lib/utils"

type OklchPickerProps = {
  defaultColor?: Oklch
  showRamp?: boolean
  compact?: boolean
  /** Pass a hook instance created elsewhere to keep an external trigger/preview in sync with this picker. */
  colorState?: UseOklchColorReturn
}

export function OklchPicker({
  defaultColor = DEFAULT_OKLCH_COLOR,
  showRamp = true,
  compact = false,
  colorState,
}: OklchPickerProps) {
  const ownState = useOklchColor(defaultColor)
  const {
    color,
    setColor,
    inGamut,
    displayColor,
    hex,
    css,
    shades,
    hexText,
    setHexText,
    hexFocused: hexFocusedRef,
    commitHex,
    cssText,
    setCssText,
    cssFocused: cssFocusedRef,
    commitCss,
    randomize,
  } = colorState ?? ownState

  const previewTextColor =
    displayColor.l > 0.55 ? "oklch(0.16 0 0)" : "oklch(0.97 0 0)"

  return (
    <div className={cn("@container grid", compact ? "gap-4" : "gap-8")}>
      <div
        className={cn(
          "grid @2xl:grid-cols-[1.1fr_1fr]",
          compact ? "gap-3" : "gap-6"
        )}
      >
        {/* Live preview */}
        <div
          className={cn(
            "border-border/70 relative flex flex-col justify-between rounded-md border transition-colors duration-150",
            compact ? "min-h-40 p-3 sm:min-h-44" : "min-h-64 p-5 sm:min-h-72"
          )}
          style={{ backgroundColor: hex }}
        >
          <div className="flex items-start justify-between gap-3">
            <span
              className="text-xs font-medium tracking-[0.08em] uppercase opacity-70"
              style={{ color: previewTextColor }}
            >
              Selected color
            </span>
            {!inGamut && (
              <span
                className="flex items-center gap-1 text-xs opacity-80"
                style={{ color: previewTextColor }}
                title="Chroma reduced to render in sRGB"
              >
                <TriangleAlert className="size-3.5" aria-hidden />
                out of gamut
              </span>
            )}
          </div>
          <div className="grid gap-1">
            <CopyButton value={css} label="OKLCH value">
              <span
                className={cn(
                  "block font-mono tabular-nums",
                  compact ? "text-sm" : "text-lg sm:text-xl"
                )}
                style={{ color: previewTextColor }}
              >
                {css}
              </span>
            </CopyButton>
            <CopyButton value={hex} label="hex value">
              <span
                className="block font-mono text-sm tabular-nums opacity-70"
                style={{ color: previewTextColor }}
              >
                {hex}
              </span>
            </CopyButton>
          </div>
        </div>

        {/* Controls */}
        <div
          className={cn(
            "border-border/70 grid rounded-md border",
            compact ? "gap-3 p-3" : "gap-5 p-5"
          )}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-muted-foreground text-xs font-medium tracking-[0.08em] uppercase">
              Channels
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={randomize}
              className="h-7 gap-1.5 font-mono text-xs"
            >
              <Dices className="size-3.5" aria-hidden />
              Random
            </Button>
          </div>

          <div className="grid gap-2">
            <span className="text-muted-foreground text-xs font-medium tracking-[0.08em] uppercase">
              Spectrum
            </span>
            <SpectrumPicker
              l={color.l}
              c={color.c}
              h={color.h}
              onChange={(l, c) => setColor((prev) => ({ ...prev, l, c }))}
              compact={compact}
            />
          </div>

          <ChannelSlider
            label="Lightness"
            value={color.l}
            min={0}
            max={1}
            step={0.001}
            precision={3}
            gradient={buildChannelGradient("l", color)}
            onChange={(l) => setColor((prev) => ({ ...prev, l }))}
            compact={compact}
          />
          <ChannelSlider
            label="Chroma"
            value={color.c}
            min={0}
            max={0.4}
            step={0.001}
            precision={3}
            gradient={buildChannelGradient("c", color)}
            onChange={(c) => setColor((prev) => ({ ...prev, c }))}
            compact={compact}
          />
          <ChannelSlider
            label="Hue"
            value={color.h}
            min={0}
            max={360}
            step={0.1}
            precision={1}
            suffix="°"
            gradient={buildChannelGradient("h", color)}
            onChange={(h) => setColor((prev) => ({ ...prev, h: clampH(h) }))}
            compact={compact}
          />

          <div
            className={cn(
              "border-border/70 mt-1 grid border-t @sm:grid-cols-2",
              compact ? "gap-2 pt-3" : "gap-3 pt-4"
            )}
          >
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
            <label className="grid gap-1.5">
              <span className="text-muted-foreground text-xs font-medium tracking-[0.08em] uppercase">
                oklch()
              </span>
              <input
                value={cssText}
                onFocus={() => {
                  cssFocusedRef.current = true
                }}
                onChange={(e) => setCssText(e.target.value)}
                onBlur={() => {
                  cssFocusedRef.current = false
                  commitCss()
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur()
                }}
                className="border-border focus:border-foreground rounded-sm border bg-transparent px-2 py-1.5 font-mono text-sm outline-none"
                spellCheck={false}
              />
            </label>
          </div>
        </div>
      </div>

      {showRamp && <ShadeRamp shades={shades} />}
    </div>
  )
}
