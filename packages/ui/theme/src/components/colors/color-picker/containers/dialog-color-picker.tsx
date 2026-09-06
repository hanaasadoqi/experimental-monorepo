"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui-components/base/dialog"
import {
  DEFAULT_OKLCH_COLOR,
  useOklchColor,
} from "../../../../hooks/use-oklch-color"
import type { Oklch } from "@repo/domain-theme"
// import { ColorSwatchTrigger } from "../pickers/color-swatch-trigger"
// import { OklchPicker } from "../pickers/oklch-picker"

type DialogColorPickerProps = {
  defaultColor?: Oklch
}

/** Centered modal — focuses attention on the picker, useful when color selection is a deliberate, blocking step. */
export function DialogColorPicker({
  defaultColor = DEFAULT_OKLCH_COLOR,
}: DialogColorPickerProps) {
  const _colorState = useOklchColor(defaultColor)

  return (
    <Dialog>
      <DialogTrigger
      // render={
      //   <ColorSwatchTrigger
      //     hex={colorState.hex}
      //     css={colorState.css}
      //     className="w-56"
      //     aria-label="Open color picker in dialog"
      //   />
      // }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-base">Edit color</DialogTitle>
          <DialogDescription>
            Adjust the OKLCH channels and generate a shade scale.
          </DialogDescription>
        </DialogHeader>
        {/* <OklchPicker colorState={colorState} /> */}
      </DialogContent>
    </Dialog>
  )
}
