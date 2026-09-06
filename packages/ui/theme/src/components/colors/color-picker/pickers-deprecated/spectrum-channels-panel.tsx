"use client"

import type { Dispatch, SetStateAction } from "react"
import { clampH, type Oklch } from "@repo/domain-theme"
import { Button } from "@repo/ui-components/base/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui-components/base/collapsible"
import { buildChannelGradient } from "../../../../utils/build-channel-gradient"
import { ChannelSlider } from "./channel-slider"
import { SpectrumPicker } from "./spectrum-picker"

type SpectrumChannelsPanelProps = {
  color: Oklch
  setColor: Dispatch<SetStateAction<Oklch>>
}

/**
 * Spectrum tab: the 2D lightness/chroma plane at the current hue, with the
 * three per-channel sliders tucked behind a disclosure so the default view
 * stays compact enough for a sidebar.
 */
export function SpectrumChannelsPanel({
  color,
  setColor,
}: SpectrumChannelsPanelProps) {
  return (
    <div className="grid gap-3">
      <SpectrumPicker
        l={color.l}
        c={color.c}
        h={color.h}
        onChange={(l, c) => setColor((previous) => ({ ...previous, l, c }))}
        compact
      />

      <Collapsible className="grid gap-2">
        <CollapsibleTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center gap-2 px-3 py-2 text-xs font-medium tracking-[0.08em] uppercase"
            >
              Adjust channels
            </Button>
          }
        />
        <CollapsibleContent className="grid gap-3 pt-1">
          <ChannelSlider
            label="Lightness"
            value={color.l}
            min={0.15}
            max={0.9}
            step={0.005}
            precision={2}
            gradient={buildChannelGradient("l", color)}
            onChange={(l) => setColor((previous) => ({ ...previous, l }))}
            compact
          />
          <ChannelSlider
            label="Chroma"
            value={color.c}
            min={0}
            max={0.4}
            step={0.001}
            precision={2}
            gradient={buildChannelGradient("c", color)}
            onChange={(c) => setColor((previous) => ({ ...previous, c }))}
            compact
          />
          <ChannelSlider
            label="Hue"
            value={color.h}
            min={0}
            max={360}
            step={0.1}
            precision={0}
            suffix="°"
            gradient={buildChannelGradient("h", color)}
            onChange={(h) =>
              setColor((previous) => ({ ...previous, h: clampH(h) }))
            }
            compact
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
