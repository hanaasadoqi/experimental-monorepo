import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui-components/base"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TypographyPanel(typescale: any[]) {
  return (
    <div className="flex flex-col gap-8">
      <div className="border-b border-border pb-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-primary">
          Foundation / typography
        </p>
        <h2 className="max-w-3xl text-4xl font-semibold tracking-tighter text-balance sm:text-5xl">
          Typography should feel precise, quiet, and unmistakably useful.
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
          A professional type system creates hierarchy before decoration. Use
          weight, scale, and rhythm to guide attention through dense product
          surfaces.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Type specimen
          </p>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Eyebrow / 13px / medium
            </p>
            <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              The interface is the argument.
            </h3>
          </div>
          <p className="max-w-xl text-base leading-7">
            Good typography lets the product speak clearly. It creates a
            dependable rhythm across navigation, documentation, settings, and
            the moments where users need to make a decision.
          </p>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Supporting copy can recede without disappearing. Keep line lengths
            intentional and use contrast to communicate importance, not merely
            to create visual variety.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <a
              href="#"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Read the principles
            </a>
            <span className="text-muted-foreground">or</span>
            <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
              font-mono
            </code>
          </div>
        </div>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Type tokens</CardTitle>
            <CardDescription>
              Scale, leading, and optical tracking.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {typescale.map(([name, classes, spec]) => (
              <div
                key={name}
                className="flex items-baseline justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <span className={classes}>{name}</span>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                  {spec}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-none">
          <CardContent className="flex flex-col gap-2 p-5">
            <span className="text-xs text-muted-foreground">Regular / 400</span>
            <span className="text-lg">Build with intent.</span>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="flex flex-col gap-2 p-5">
            <span className="text-xs text-muted-foreground">Medium / 500</span>
            <span className="text-lg font-medium">Build with intent.</span>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="flex flex-col gap-2 p-5">
            <span className="text-xs text-muted-foreground">
              Semibold / 600
            </span>
            <span className="text-lg font-semibold">Build with intent.</span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
