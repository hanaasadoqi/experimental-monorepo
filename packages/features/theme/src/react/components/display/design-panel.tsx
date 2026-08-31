export interface DesignPanelProps {
  spacing: string[]
  radii: Array<[string, string]>
}

export function DesignPanel({ spacing, radii }: DesignPanelProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
          Foundation / design
        </p>
        <h2 className="text-2xl font-semibold tracking-[-0.03em]">
          Quiet geometry, consistent everywhere.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Spacing, radius, and borders are the invisible system behind a
          polished interface. These examples make those decisions tangible.
        </p>
      </div>

      {/* Spacing Scale */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-medium">Spacing scale</h3>
          <span className="text-xs text-muted-foreground">4px base unit</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {spacing.map((step) => (
            <div
              key={step}
              className="flex items-center gap-3 rounded-lg border border-border p-3"
            >
              <div
                className="shrink-0 bg-primary"
                style={{
                  width: `${Number(step) * 4}px`,
                  height: `${Number(step) * 4}px`,
                }}
              />
              <div>
                <p className="font-mono text-xs">gap-{step}</p>
                <p className="text-xs text-muted-foreground">
                  {Number(step) * 4}px
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Border Radius */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-medium">Border radius</h3>
          <span className="text-xs text-muted-foreground">
            soft, not ornamental
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {radii.map(([radius, radiusClass]) => (
            <div key={radius} className="flex flex-col items-center gap-2">
              <div
                className={`size-16 border-2 border-primary bg-primary/10 ${radiusClass}`}
              />
              <span className="font-mono text-[11px] text-muted-foreground">
                rounded-{radius}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Border Treatments */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-medium">Border treatments</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-medium">Hairline</p>
            <div className="my-4 border-t border-border" />
            <p className="text-xs text-muted-foreground">Default separation</p>
          </div>

          <div className="rounded-lg border border-primary/40 bg-card p-4">
            <p className="text-sm font-medium">Emphasis</p>
            <div className="my-4 border-t border-primary/40" />
            <p className="text-xs text-muted-foreground">Focused state</p>
          </div>

          <div className="rounded-lg border-2 border-dashed border-border bg-card p-4">
            <p className="text-sm font-medium">Dashed</p>
            <div className="my-4 border-t-2 border-dashed border-border" />
            <p className="text-xs text-muted-foreground">Empty or drop state</p>
          </div>
        </div>
      </section>
    </div>
  )
}
