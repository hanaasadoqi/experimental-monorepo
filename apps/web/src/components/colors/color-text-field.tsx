"use client"

import React from "react"
import { cn } from "@repo/ui-components/lib/utils"

type ColorTextFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  onFocusChange: (focused: boolean) => void
  onCommit: () => void
  className?: string
  ref?: React.Ref<HTMLLabelElement>
}

/**
 * Labeled text input for a color format (hex, oklch(), rgb()). Edits are
 * buffered locally while focused and only parsed/committed on blur or Enter,
 * so an in-progress keystroke is never rejected mid-edit.
 */
export function ColorTextField({
  label,
  value,
  onChange,
  onFocusChange,
  onCommit,
  className,
  ref,
}: ColorTextFieldProps): React.ReactElement {
  return (
    <label ref={ref} className={cn("grid gap-1.5", className)}>
      <span className="text-muted-foreground text-xs font-medium tracking-[0.08em] uppercase">
        {label}
      </span>
      <input
        value={value}
        onFocus={() => onFocusChange(true)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          onFocusChange(false)
          onCommit()
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur()
        }}
        className="border-border focus:border-foreground rounded-sm border bg-transparent px-2 py-1.5 font-mono text-sm outline-none"
        spellCheck={false}
      />
    </label>
  )
}
