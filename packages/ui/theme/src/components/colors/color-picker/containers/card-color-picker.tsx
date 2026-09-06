"use client"

import type { Oklch } from "@repo/domain-theme/colors"
import { DEFAULT_OKLCH_COLOR } from "../../../../hooks/use-oklch-color"
// import { OklchPicker } from "../pickers/oklch-picker"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui-components/base/card"

type CardColorPickerProps = {
  defaultColor?: Oklch
}

/** Self-contained block for embedding directly on a page, dashboard, or settings panel. */
export function CardColorPicker({
  defaultColor: _defaultColor = DEFAULT_OKLCH_COLOR,
}: CardColorPickerProps) {
  // const colorState = useOklchColor(defaultColor)

  return (
    <Card className="gap-5">
      <CardHeader>
        <CardTitle className="font-mono text-base">Brand color</CardTitle>
        <CardDescription>
          Pick an OKLCH value and generate its shade scale.
        </CardDescription>
      </CardHeader>
      <CardContent>{/* <OklchPicker colorState={colorState} /> */}</CardContent>
    </Card>
  )
}
