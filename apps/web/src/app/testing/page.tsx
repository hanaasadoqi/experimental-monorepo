"use client"

// import { OklchPicker } from "@/components/color-picker/oklch-picker"
// import { AccentHarmonyPicker } from "@/components/color-picker/accent-harmony-picker"
// import { PopoverColorPicker } from "@/components/color-picker/views/popover-color-picker"
// import { SheetColorPicker } from "@/components/color-picker/views/sheet-color-picker"
// import { TabsColorPicker } from "@/components/color-picker/views/tabs-color-picker"
// import { CardColorPicker } from "@/components/color-picker/views/card-color-picker"
// import { DialogColorPicker } from "../../color-picker/views/dialog-color-picker"

import { useOklchColor } from "@repo/features-theme/react";
import { ChevronDown, Info } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@repo/ui-components/base/collapsible";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@repo/ui-components/base/hover-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui-components/base/card"

const VIEWS = [
  {
    title: "Popover",
    description: "A compact swatch trigger that expands into the full editor inline. Best for toolbars.",
    render: () => <PopoverColorPicker defaultColor={{ l: 0.64, c: 0.14, h: 250 }} onChange={() => { }} />,
  },
  {
    title: "Sheet",
    description: "Opens a full-height side panel with room for every control at once.",
    render: () => <SheetColorPicker defaultColor={{ l: 0.7, c: 0.17, h: 25 }} onChange={() => { }} />,
  },
  {
    title: "Modal",
    description: "A centered dialog that blocks the page — for deliberate, focused color selection.",
    render: () => <DialogColorPicker defaultColor={{ l: 0.75, c: 0.16, h: 140 }} onChange={() => { }} />,
  },
] as const

export default function Page() {
  const primary = useOklchColor({ l: 0.64, c: 0.14, h: 250 })

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto grid w-full max-w-5xl gap-6">
        <header className="grid max-w-2xl gap-2">
          <span className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
            Color instrument
          </span>
          <h1 className="text-balance font-mono text-2xl leading-tight sm:text-3xl">OKLCH color picker</h1>
          <p className="max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground">
            Dial in lightness, chroma, and hue — or paste a hex or oklch() value directly. A perceptually
            even shade scale generates automatically from whatever you select.
          </p>
        </header>

        <Card size="sm" className="gap-3">
          <CardHeader className="gap-1 px-4 py-3">
            <CardTitle className="font-mono text-sm">Color system</CardTitle>
            <CardDescription className="text-xs">Choose a primary color, then generate a compact accent pairing.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 px-4">
            <OklchPicker colorState={primary} compact />
            <AccentHarmonyPicker baseColor={primary.color} className="gap-3 p-3" />
          </CardContent>
        </Card>

        <section className="grid gap-3">
          <Collapsible defaultOpen>
            <div className="flex items-center justify-between gap-4 border-y border-border/70 py-3">
              <div className="grid gap-1">
                <h2 className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
                  Five ways to surface it
                </h2>
                <p className="text-xs text-muted-foreground">Progressive disclosure for compact product surfaces.</p>
              </div>
              <CollapsibleTrigger
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-border/70 text-muted-foreground transition hover:border-foreground/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Toggle picker view examples"
              >
                <HugeiconsIcon icon={ChevronDown} className="size-4 transition-transform data-[panel-open]:rotate-180" aria-hidden />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="pt-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {VIEWS.map((view) => (
                  <HoverCard key={view.title}>
                    <div className="grid gap-2 rounded-md border border-border/70 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="grid gap-1">
                          <h3 className="font-mono text-sm">{view.title}</h3>
                          <p className="text-xs leading-relaxed text-muted-foreground">{view.description}</p>
                        </div>
                        <HoverCardTrigger
                          render={
                            <button
                              type="button"
                              className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                              aria-label={`More about the ${view.title} view`}
                            >
                              <HugeiconsIcon icon={Info} className="size-3.5" aria-hidden />
                            </button>
                          }
                        />
                      </div>
                      {view.render()}
                    </div>
                    <HoverCardContent>
                      <p className="font-mono text-xs text-foreground">{view.title} view</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{view.description}</p>
                    </HoverCardContent>
                  </HoverCard>
                ))}

                <div className="grid gap-3 rounded-md border border-border/70 p-3 sm:col-span-2 lg:col-span-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid gap-1">
                      <h3 className="font-mono text-sm">Tabs</h3>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Spectrum, shades, and raw values stay separated until needed.
                      </p>
                    </div>
                    <span className="rounded-full border border-border/70 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                      limited space
                    </span>
                  </div>
                  <TabsColorPicker defaultColor={{ l: 0.55, c: 0.19, h: 300 }} />
                </div>

                <div className="grid gap-3 sm:col-span-2 lg:col-span-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid gap-1">
                      <h3 className="font-mono text-sm">Card</h3>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        A permanent, self-contained editor for settings and dashboards.
                      </p>
                    </div>
                    <span className="rounded-full border border-border/70 px-2 py-1 font-mono text-[10px] text-muted-foreground">
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
