"use client"

import * as React from "react"
import { createContext, useContext, useMemo, useState } from "react"
import { Check, Clipboard, Search, X } from "@hugeicons/core-free-icons"
import { HugeiconsIcon as HugeIcon } from "@hugeicons/react"
import { cva, type VariantProps } from "class-variance-authority"

import { Badge } from "../../base/ui/badge"
import { Button } from "../../base/ui/button"
import { cn } from "../../lib/utils"

type CodeBlockDiff = {
  added?: number[]
  removed?: number[]
}

type CodeBlockContextValue = {
  code: string
  language?: string
  showLineNumbers: boolean
  diff: Required<CodeBlockDiff>
  query: string
  setQuery: (query: string) => void
}

const CodeBlockContext = createContext<CodeBlockContextValue | null>(null)

function useCodeBlockContext(component: string) {
  const context = useContext(CodeBlockContext)
  if (!context) {
    throw new Error(`<${component}> must be rendered inside a <CodeBlock>.`)
  }
  return context
}

const codeBlockVariants = cva("overflow-hidden rounded-2xl text-foreground", {
  variants: {
    variant: {
      default: "border border-border bg-card shadow-sm",
      ghost: "border-0 bg-transparent shadow-none",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function highlightLine(line: string, query?: string) {
  const parts = line.split(
    /(\b(?:function|const|let|return|for|if|throw|new|async|await|export)\b|\b\d+\b|\b(?:string|number|boolean)\b|["'][^"']*["'])/g
  )
  return parts.map((part, index) => {
    const keyword =
      /^(function|const|let|return|for|if|throw|new|async|await|export)$/.test(
        part
      )
    const number = /^\d+$/.test(part)
    const string = /^("[^"']*"|'[^"']*')$/.test(part)
    const type = /^(string|number|boolean)$/.test(part)
    const content = query
      ? part.split(new RegExp(`(${escapeRegExp(query)})`, "ig"))
      : [part]
    return content.map((chunk, chunkIndex) =>
      query && chunk.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={`${index}-${chunkIndex}`}
          className="rounded-sm bg-accent px-0.5 text-accent-foreground"
        >
          {chunk}
        </mark>
      ) : (
        <span
          key={`${index}-${chunkIndex}`}
          className={cn(
            keyword && "text-destructive",
            number && "text-primary",
            string && "text-muted-foreground",
            type && "text-primary/80"
          )}
        >
          {chunk}
        </span>
      )
    )
  })
}

type CodeBlockProps = React.ComponentProps<"section"> &
  VariantProps<typeof codeBlockVariants> & {
    code: string
    language?: string
    showLineNumbers?: boolean
    diff?: CodeBlockDiff
    defaultQuery?: string
  }

function CodeBlock({
  code,
  language,
  showLineNumbers = false,
  diff,
  defaultQuery = "",
  variant,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const [query, setQuery] = useState(defaultQuery)

  const contextValue = useMemo<CodeBlockContextValue>(
    () => ({
      code,
      language,
      showLineNumbers,
      diff: { added: diff?.added ?? [], removed: diff?.removed ?? [] },
      query,
      setQuery,
    }),
    [code, language, showLineNumbers, diff, query]
  )

  return (
    <CodeBlockContext.Provider value={contextValue}>
      <section
        data-slot="code-block"
        data-variant={variant ?? "default"}
        aria-label={language ? `${language} code block` : "Code block"}
        className={cn(codeBlockVariants({ variant }), className)}
        {...props}
      >
        {children}
      </section>
    </CodeBlockContext.Provider>
  )
}

type CodeBlockHeaderProps = React.ComponentProps<"header">

function CodeBlockHeader({ className, ...props }: CodeBlockHeaderProps) {
  return (
    <header
      data-slot="code-block-header"
      className={cn(
        "flex min-h-14 items-center justify-between gap-3 border-b border-border px-5",
        className
      )}
      {...props}
    />
  )
}

type CodeBlockTitleProps = React.ComponentProps<"span">

function CodeBlockTitle({ className, ...props }: CodeBlockTitleProps) {
  return (
    <span
      data-slot="code-block-title"
      className={cn(
        "truncate font-mono text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

type CodeBlockChangesProps = React.ComponentProps<"div"> & {
  added?: number
  removed?: number
}

function CodeBlockChanges({
  className,
  added,
  removed,
  ...props
}: CodeBlockChangesProps) {
  const { diff } = useCodeBlockContext("CodeBlockChanges")
  const addedCount = added ?? diff.added.length
  const removedCount = removed ?? diff.removed.length

  if (!addedCount && !removedCount) return null

  return (
    <div
      data-slot="code-block-changes"
      className={cn("ml-auto flex items-center gap-1.5", className)}
      {...props}
    >
      {addedCount > 0 && <Badge variant="default">+{addedCount}</Badge>}
      {removedCount > 0 && <Badge variant="destructive">-{removedCount}</Badge>}
    </div>
  )
}

type CodeBlockCopyButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "onClick" | "children"
>

function CodeBlockCopyButton({
  className,
  ...props
}: CodeBlockCopyButtonProps) {
  const { code } = useCodeBlockContext("CodeBlockCopyButton")
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-9", className)}
      onClick={handleCopy}
      aria-label={copied ? "Code copied" : "Copy code"}
      {...props}
    >
      {copied ? (
        <HugeIcon icon={Check} data-icon="inline-start" />
      ) : (
        <HugeIcon icon={Clipboard} data-icon="inline-start" />
      )}
    </Button>
  )
}

type CodeBlockSearchProps = Omit<React.ComponentProps<"div">, "children">

function CodeBlockSearch({ className, ...props }: CodeBlockSearchProps) {
  const { code, query, setQuery } = useCodeBlockContext("CodeBlockSearch")

  const matches = useMemo(() => {
    if (!query) return 0
    return (code.match(new RegExp(escapeRegExp(query), "gi")) ?? []).length
  }, [code, query])

  return (
    <div
      data-slot="code-block-search"
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {query ? (
        <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          {matches} {matches === 1 ? "match" : "matches"}
        </span>
      ) : null}
      <div className="flex h-9 items-center overflow-hidden rounded-lg border border-border bg-background">
        <HugeIcon
          icon={Search}
          className="ml-2.5 size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          aria-label="Search code"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-28 bg-transparent px-2 text-sm outline-none sm:w-40"
        />
        {query ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-none"
            onClick={() => setQuery("")}
            aria-label="Close search"
          >
            <HugeIcon icon={X} data-icon="inline-start" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

type CodeBlockContentProps = React.ComponentProps<"div">

function CodeBlockContent({ className, ...props }: CodeBlockContentProps) {
  const { code, showLineNumbers, diff, query } =
    useCodeBlockContext("CodeBlockContent")
  const lines = useMemo(() => code.replace(/\n$/, "").split("\n"), [code])

  return (
    <div
      data-slot="code-block-content"
      className={cn("overflow-x-auto px-4 py-5 sm:px-5", className)}
      {...props}
    >
      <pre className="min-w-max font-mono text-[15px] leading-[1.8] text-foreground">
        <code>
          {lines.map((line, index) => {
            const lineNumber = index + 1
            const isAdded = diff.added.includes(lineNumber)
            const isRemoved = diff.removed.includes(lineNumber)
            return (
              <span
                key={`${index}-${line}`}
                className={cn(
                  "block",
                  isAdded && "bg-primary/10",
                  isRemoved && "bg-destructive/10"
                )}
              >
                {showLineNumbers && (
                  <span className="mr-5 inline-block w-5 select-none text-right text-muted-foreground/60">
                    {lineNumber}
                  </span>
                )}
                {highlightLine(line, query)}
              </span>
            )
          })}
        </code>
      </pre>
    </div>
  )
}

export {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockChanges,
  CodeBlockCopyButton,
  CodeBlockSearch,
  CodeBlockContent,
}

export type {
  CodeBlockProps,
  CodeBlockHeaderProps,
  CodeBlockTitleProps,
  CodeBlockChangesProps,
  CodeBlockCopyButtonProps,
  CodeBlockSearchProps,
  CodeBlockContentProps,
  CodeBlockDiff,
}
