"use client"

import {
  DEFAULT_OKLCH_COLOR,
  useOklchColor,
  type UseOklchColorReturn,
} from "@repo/ui-theme"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui-components/base/tabs"
import type { Oklch } from "@repo/domain-theme"
import { ShadeRamp } from "../shade-ramp"
import { ColorPreviewHeader } from "./color-preview-header"
import { SpectrumChannelsPanel } from "./spectrum-channels-panel"
import { ColorValuesPanel } from "./color-values-panel"

type TabsOklchPickerProps = {
  defaultColor?: Oklch
  /** Pass a hook instance created elsewhere to keep an external trigger/preview in sync with this picker. */
  colorState?: UseOklchColorReturn
}

/**
 * Progressive-disclosure picker for tight sidebars/properties panels: the
 * spectrum, generated shades, and raw values each get their own tab instead
 * of competing for vertical space at once.
 */
export function TabsOklchPicker({
  defaultColor = DEFAULT_OKLCH_COLOR,
  colorState,
}: TabsOklchPickerProps) {
  const ownState = useOklchColor(defaultColor)
  const state = colorState ?? ownState
  const { color, setColor, inGamut, hex, css, shades, randomize } = state

  return (
    <div className="border-border/70 grid w-full max-w-xs gap-3 rounded-md border p-4">
      <ColorPreviewHeader
        hex={hex}
        css={css}
        inGamut={inGamut}
        onRandomize={randomize}
      />

      <Tabs defaultValue="spectrum">
        <TabsList className="w-full">
          <TabsTrigger value="spectrum">Spectrum</TabsTrigger>
          <TabsTrigger value="shades">Shades</TabsTrigger>
          <TabsTrigger value="values">Values</TabsTrigger>
        </TabsList>

        <TabsContent value="spectrum" className="pt-3">
          <SpectrumChannelsPanel color={color} setColor={setColor} />
        </TabsContent>

        <TabsContent value="shades" className="pt-3">
          <ShadeRamp shades={shades} />
        </TabsContent>

        <TabsContent value="values" className="grid gap-3 pt-3">
          <ColorValuesPanel colorState={state} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
