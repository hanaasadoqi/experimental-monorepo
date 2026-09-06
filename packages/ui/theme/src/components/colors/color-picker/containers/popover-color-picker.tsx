"use client"

import {
  DEFAULT_OKLCH_COLOR,
  useOklchColor,
} from "../../../../hooks/use-oklch-color"
import type { Oklch } from "@repo/domain-theme"
import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui-components/base/popover"
// import { ColorSwatchTrigger } from "../pickers/color-swatch-trigger"
// import { CompactOklchPicker } from "../pickers/compact-oklch-picker"

type PopoverColorPickerProps = {
  defaultColor?: Oklch
}

/** Compact trigger that expands into a full picker in a floating popover — ideal for toolbars and inline controls. */
export function PopoverColorPicker({
  defaultColor = DEFAULT_OKLCH_COLOR,
}: PopoverColorPickerProps) {
  const [open, setOpen] = useState(false)
  const _colorState = useOklchColor(defaultColor)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
      // render={
      // <ColorSwatchTrigger
      //   hex={colorState.hex}
      //   css={colorState.css}
      //   className="w-56"
      //   aria-label="Open color picker"
      // />
      // }
      />
      <PopoverContent align="start" className="w-auto p-4">
        {/* <CompactOklchPicker colorState={colorState} /> */}
      </PopoverContent>
    </Popover>
  )
}
