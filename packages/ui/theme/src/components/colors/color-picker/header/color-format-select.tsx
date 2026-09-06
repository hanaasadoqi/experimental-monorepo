"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui-components/base/select"
import React from "react"

export const ColorFormatSelect = () => {
  const [selectedFormat, setSelectedFormat] = React.useState("css")
  const items = [
    { value: "css", label: "OKLCH" },
    { value: "hex", label: "HEX" },
    { value: "rgb", label: "RGB" },
  ]

  return (
    <div className="w-1/3">
      <Select
        items={items}
        defaultValue={selectedFormat}
        onValueChange={(value) => setSelectedFormat(value ?? "css")}
        highlightItemOnHover
      >
        <SelectTrigger className="w-full max-w-48" size="sm">
          <SelectValue placeholder="Select a color scale" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
