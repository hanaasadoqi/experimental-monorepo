"use client"

import type { ReactNode } from "react"
import { cn } from "@repo/ui-components/lib/utils"
import React from "react"
import { CheckIcon, ClipboardIcon } from "lucide-react"

type CopyButtonProps = {
  value: string
  children?: ReactNode
  className?: string
  label?: string
  title?: string
  render?: (copied: boolean) => ReactNode
}

export function CopyButton({
  value,
  children,
  className,
  label,
  title,
  render,
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    if (copied) {
      timeoutRef.current = setTimeout(() => {
        setCopied(false)
      }, 2000)
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [copied])
  return (
    <button
      type="button"
      title={title}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          // eslint-disable-next-line no-console
          console.log(`Copied ${label ?? "value"}`, { description: value })
        } catch {
          // toast.error("Couldn't copy to clipboard")
          console.error("Couldn't copy to clipboard")
          setCopied(false)
          return
        }
        setCopied(true)
      }}
      className={cn(
        "cursor-pointer text-left transition-opacity hover:opacity-70 active:opacity-50",
        className
      )}
    >
      {(render ? render(copied) : children) ?? (
        <ClipboardStatusIcon copied={copied} value={value}>
          <ClipboardIcon className="size-4 shrink-0" />
        </ClipboardStatusIcon>
      )}
    </button>
  )
}

function ClipboardStatusIcon({
  children,
  copied,
  value,
  className,
}: {
  children?: ReactNode
  copied: boolean
  value: string
  className?: string
}) {
  return (
    <span className="border-border/70 focus-visible:ring-ring focus-visible:outline-ring absolute inset-0 z-10 flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-sm border text-center text-xs font-medium tracking-[0.08em] transition hover:opacity-70 focus-visible:ring-[3px] focus-visible:outline-1 active:opacity-50">
      {children}
      {copied ? (
        <span className="text-success">
          <CheckIcon className={className} />
        </span>
      ) : (
        <span className="font-mono text-xs tabular-nums">{value}</span>
      )}
    </span>
  )
}
