"use client"

import {
  DEFAULT_OKLCH_COLOR,
  useOklchColor,
} from "../../../../hooks/use-oklch-color"
import type { Oklch } from "@repo/domain-theme"
import { TabsOklchPicker } from "../color-picker"

type TabsColorPickerProps = {
  defaultColor?: Oklch
}

/**
 * Progressive-disclosure widget for tight sidebars/properties panels: the picker,
 * generated shades, and raw values each get their own tab instead of competing
 * for vertical space at once.
 */
export function TabsColorPicker({
  defaultColor = DEFAULT_OKLCH_COLOR,
}: TabsColorPickerProps) {
  const colorState = useOklchColor(defaultColor)

  return <TabsOklchPicker colorState={colorState} />
}
