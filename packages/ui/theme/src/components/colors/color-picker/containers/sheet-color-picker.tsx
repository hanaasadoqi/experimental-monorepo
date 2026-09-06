"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui-components/base/sheet"
import {
  DEFAULT_OKLCH_COLOR,
  useOklchColor,
} from "../../../../hooks/use-oklch-color"
import type { Oklch } from "@repo/domain-theme"
// import { OklchPicker } from "../pickers/oklch-picker"

// const ColorSwatchTrigger = dynamic(
//   () =>
//     import(".").then((mod) => ({
//       default: mod.ColorSwatchTrigger,
//     })),
//   {
//     ssr: false,
//   }
// )

type SheetColorPickerProps = {
  defaultColor?: Oklch
}

/** Full-height side panel — gives the picker room for every control at once without leaving the page. */
export function SheetColorPicker({
  defaultColor = DEFAULT_OKLCH_COLOR,
}: SheetColorPickerProps) {
  const _colorState = useOklchColor(defaultColor)

  return (
    <Sheet>
      {/* <DialogRoot> */}
      <SheetTrigger
      // render={
      // <ColorSwatchTrigger
      //   hex={colorState.hex}
      //   css={colorState.css}
      //   className="w-56"
      //   aria-label="Open color picker in side panel"
      // />
      // }
      />
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle className="font-mono text-base">Edit color</SheetTitle>
          <SheetDescription>
            Adjust the OKLCH channels and generate a shade scale.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          {/* <OklchPicker colorState={colorState} /> */}
        </div>
      </SheetContent>

      {/* </DialogRoot> */}
    </Sheet>
  )
}
