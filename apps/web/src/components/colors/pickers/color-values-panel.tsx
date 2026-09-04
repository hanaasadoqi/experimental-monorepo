"use client"

import type { ColorFormat, UseOklchColorReturn } from "@repo/ui-theme"
import { ColorTextField } from "../color-text-field"
import type { ComponentType } from "react"

// The field's implementation accepts its forwarded ref as a second argument,
// but its exported type is not recognized as a JSX component by this app's
// React typings. Keep the public props unchanged while adapting that type here.
const ColorTextFieldComponent = ColorTextField as unknown as ComponentType<
  Parameters<typeof ColorTextField>[0]
>

const DEFAULT_FORMATS: ColorFormat[] = ["rgb", "oklch", "hex"]

/** One editable field per requested format, driven by `resolveColorState`. */
export const getColorValuesPanel = (
  colorState: UseOklchColorReturn,
  display: ColorFormat[] = DEFAULT_FORMATS
) =>
  display.map((color) => {
    const resolvedColor = colorState.resolveColorState(color)

    return (
      <ColorTextFieldComponent
        key={color}
        label={resolvedColor.format.toUpperCase()}
        value={resolvedColor.value}
        onChange={resolvedColor.setValue}
        onFocusChange={(focused) => {
          if (!resolvedColor.focusedRef) return
          resolvedColor.focusedRef.current = focused
        }}
        onCommit={resolvedColor.commit}
      />
    )
  })

type ColorValuesPanelProps = {
  colorState: UseOklchColorReturn
  /** Which representations to show, in order. */
  formats?: ColorFormat[]
}

/** Values tab: raw rgb()/oklch()/hex representations, each editable and validated on commit. */
export function ColorValuesPanel({
  colorState,
  formats = DEFAULT_FORMATS,
}: ColorValuesPanelProps) {
  return <>{getColorValuesPanel(colorState, formats)}</>
}
