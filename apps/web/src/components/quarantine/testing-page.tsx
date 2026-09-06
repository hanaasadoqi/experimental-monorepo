"use client"

import { HarmonyPicker, useOklchColor } from "@repo/ui-theme"
import { ChevronDown, Info } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui-components/base/collapsible"
// import { HoverCard, HoverCardContent, HoverCardTrigger } from "@repo/ui-components/base/hover-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui-components/base/card"
import type { Oklch } from "@repo/domain-theme"
import React from "react"
import {
  CardColorPicker,
  DialogColorPicker,
  OklchPicker,
  PopoverColorPicker,
  SheetColorPicker,
  TabsColorPicker,
} from "@/components/colors"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@repo/ui-components/base/hover-card"

const colors = [
  { l: 0.64, c: 0.14, h: 250 },
  { l: 0.7, c: 0.17, h: 25 },
  { l: 0.75, c: 0.16, h: 140 },
  { l: 0.6, c: 0.12, h: 300 },
  { l: 0.95, c: 0.43, h: 200 },
] as const

const VIEWS = [
  {
    title: "Popover",
    description:
      "A compact swatch trigger that expands into the full editor inline. Best for toolbars.",
    render: () => <PopoverColorPicker defaultColor={colors[0]} />,
  },
  {
    title: "Sheet",
    description:
      "Opens a full-height side panel with room for every control at once.",
    render: () => <SheetColorPicker defaultColor={colors[1]} />,
  },
  {
    title: "Modal",
    description:
      "A centered dialog that blocks the page — for deliberate, focused color selection.",
    render: () => <DialogColorPicker defaultColor={colors[2]} />,
  },
  {
    title: "Tabs",
    description:
      "Spectrum, shades, and raw values stay separated until needed.",
    render: () => <TabsColorPicker defaultColor={colors[3]} />,
  },
  {
    title: "Card",
    description:
      "A permanent, self-contained editor for settings and dashboards.",
    render: () => <CardColorPicker defaultColor={colors[0]} />,
  },
] as const

export default function Page() {
  const [accent, setAccent] = React.useState<Oklch | null>(null)
  const _primary = useOklchColor({ l: 0.64, c: 0.14, h: 250 })

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto grid w-full max-w-5xl gap-6">
        <header className="grid max-w-2xl gap-2">
          <span className="text-muted-foreground text-xs font-medium tracking-[0.08em] uppercase">
            Color instrument
          </span>
          <h1 className="font-mono text-2xl leading-tight text-balance sm:text-3xl">
            OKLCH color picker
          </h1>
          <p className="text-muted-foreground max-w-lg text-sm leading-relaxed text-pretty">
            Dial in lightness, chroma, and hue — or paste a hex or oklch() value
            directly. A perceptually even shade scale generates automatically
            from whatever you select.
          </p>
        </header>

        <Card size="sm" className="gap-3">
          <CardHeader className="gap-1 px-4 py-3">
            <CardTitle className="font-mono text-sm">Color system</CardTitle>
            <CardDescription className="text-xs">
              Choose a primary color, then generate a compact accent pairing.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 px-4">
            <OklchPicker defaultColor={_primary.color} compact />
            {accent && (
              <HarmonyPicker
                primaryColor={_primary.color}
                onAccentColorChange={(color: Oklch) => setAccent(color)}
                accentColor={accent}
              />
            )}
          </CardContent>
        </Card>

        <section className="grid gap-3">
          <Collapsible defaultOpen>
            <div className="border-border/70 flex items-center justify-between gap-4 border-y py-3">
              <div className="grid gap-1">
                <h2 className="text-muted-foreground text-xs font-medium tracking-[0.08em] uppercase">
                  Five ways to surface it
                </h2>
                <p className="text-muted-foreground text-xs">
                  Progressive disclosure for compact product surfaces.
                </p>
              </div>
              <CollapsibleTrigger
                className="border-border/70 text-muted-foreground hover:border-foreground/40 hover:text-foreground focus-visible:ring-ring inline-flex size-9 shrink-0 items-center justify-center rounded-sm border transition focus-visible:ring-2"
                aria-label="Toggle picker view examples"
              >
                <HugeiconsIcon
                  icon={ChevronDown}
                  className="size-4 transition-transform data-panel-open:rotate-180"
                  aria-hidden
                />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="pt-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {VIEWS.map((view) => (
                  <HoverCard key={view.title}>
                    <div className="border-border/70 grid gap-2 rounded-md border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="grid gap-1">
                          <h3 className="font-mono text-sm">{view.title}</h3>
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            {view.description}
                          </p>
                        </div>
                        <HoverCardTrigger
                          render={
                            <button
                              type="button"
                              className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring inline-flex size-7 shrink-0 items-center justify-center rounded-sm focus-visible:ring-2"
                              aria-label={`More about the ${view.title} view`}
                            >
                              <HugeiconsIcon
                                icon={Info}
                                className="size-3.5"
                                aria-hidden
                              />
                            </button>
                          }
                        />
                      </div>
                      {view.render()}
                    </div>
                    <HoverCardContent>
                      <p className="text-foreground font-mono text-xs">
                        {view.title} view
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        {view.description}
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                ))}

                <div className="border-border/70 grid gap-3 rounded-md border p-3 sm:col-span-2 lg:col-span-3">
                  <div className="flex flex-col items-start justify-between gap-3">
                    <div className="grid gap-1">
                      <h3 className="font-mono text-sm">Tabs</h3>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        Spectrum, shades, and raw values stay separated until
                        needed.
                      </p>
                    </div>
                    <span className="border-border/70 text-muted-foreground rounded-full border px-2 py-1 font-mono text-[10px]">
                      limited space
                    </span>
                  </div>
                  <TabsColorPicker
                    defaultColor={{ l: 0.55, c: 0.19, h: 300 }}
                  />
                </div>

                <div className="grid flex-1 gap-3 sm:col-span-2 lg:col-span-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid gap-1">
                      <h3 className="font-mono text-sm">Card</h3>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        A permanent, self-contained editor for settings and
                        dashboards.
                      </p>
                    </div>
                    <span className="border-border/70 text-muted-foreground rounded-full border px-2 py-1 font-mono text-[10px]">
                      embedded
                    </span>
                  </div>
                  <CardColorPicker defaultColor={{ l: 0.6, c: 0.15, h: 60 }} />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </section>
      </div>
    </main>
  )
}
