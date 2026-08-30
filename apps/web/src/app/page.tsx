"use client"

import { Moon, Sun } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useSetAppearancePreference } from "@repo/feature-preferences/react"
import { useResolvedAppearance } from "@repo/feature-theme"
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
  const colorScheme = useResolvedAppearance()
  const setPreference = useSetAppearancePreference()
  const isDark = colorScheme === "dark"
  const Icon = isDark ? Sun : Moon
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This is some content inside the card. It can be any React
              component or HTML element.
            </p>
          </CardContent>
          <CardFooter>
            <CardAction>
              <Button onClick={() => setPreference(isDark ? "light" : "dark")}>
                <HugeiconsIcon icon={Icon} />
              </Button>
            </CardAction>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
