"use client"

import { Moon, Sun } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  useAppearancePreference,
  useSetAppearancePreference,
} from "@repo/features-preferences/react"
import { resolveAppearance } from "@repo/runtime-theme"
import { useSystemAppearance } from "@repo/features-theme-react"
import { Button } from "@repo/ui-components/base/button"
import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
  CardTitle,
  CardDescription,
  CardAction,
} from "@repo/ui-components/base/card"

export default function Page() {
  const preference = useAppearancePreference()
  const systemAppearance = useSystemAppearance()
  const colorScheme = resolveAppearance(preference, systemAppearance)
  const setPreference = useSetAppearancePreference()
  const isDark = colorScheme === "dark"
  const Icon = isDark ? Sun : Moon

  return (
    <main className="grid min-h-svh gap-8 p-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,40rem)]">
      <section
        className="min-w-0 text-sm leading-loose"
        aria-labelledby="application-appearance-heading"
      >
        <Card>
          <CardHeader>
            <CardTitle id="application-appearance-heading">
              Application appearance
            </CardTitle>
            <CardDescription>
              This control changes the resolved light or dark appearance for the
              whole application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This card remains outside the scoped Theme preview and does not
              consume its primary color override.
            </p>
          </CardContent>
          <CardFooter>
            <CardAction>
              <Button
                size={"icon-lg"}
                aria-label={
                  isDark ? "Use light appearance" : "Use dark appearance"
                }
                onClick={() => setPreference(isDark ? "light" : "dark")}
              >
                <HugeiconsIcon icon={Icon} />
              </Button>
            </CardAction>
          </CardFooter>
        </Card>
      </section>

      {/* <ThemeScopeProvider scopeId="preview"> */}
      <section
        className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm"
        aria-labelledby="theme-scope-heading"
      >
        <header className="mb-6">
          <h1 id="theme-scope-heading" className="text-xl font-semibold">
            Scoped Theme preview
          </h1>
          <p className="text-muted-foreground text-sm">
            This durable override applies only inside this preview boundary.
          </p>
        </header>
        {/* <ThemePreview /> */}
        {/* <ThemeForm /> */}
      </section>
      {/* </ThemeScopeProvider> */}
    </main>
  )
}
