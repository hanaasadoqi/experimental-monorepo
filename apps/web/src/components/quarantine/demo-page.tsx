"use client"

import { TabsColorPicker, ThemeSwitch } from "@repo/ui-theme"
import { Form } from "@base-ui/react"
import { useThemeStore } from "@repo/runtime-theme"
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui-components/base"
import { FieldContent, FieldLabel } from "@repo/ui-components/base/field"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@repo/ui-components/base/hover-card"
import { UiComponentShowcase } from "@repo/ui-theme"
import { BoxesIcon, Palette } from "lucide-react"
import { useRef } from "react"

export default function Demo() {
  const { isDarkModeEnabled: darkModeEnabled, toggleEnableMode } =
    useThemeStore()

  const formRef = useRef<HTMLFormElement>(null)

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 p-4">
      <div className="flex w-full flex-col items-center justify-center gap-2">
        <h1 className="text-2xl font-bold">Demo</h1>
        <HoverCard>
          <HoverCardTrigger>
            <BoxesIcon className="h-4 w-4" />
          </HoverCardTrigger>
          <HoverCardContent className="w-90">
            <div className="overflow-wrap flex h-125 flex-1 flex-col gap-2 overflow-auto">
              <UiComponentShowcase />
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      <div className="flex flex-col gap-2">
        <Form ref={formRef}>
          <div className="flex flex-1 flex-col gap-2 overflow-auto">
            <div className="flex flex-1 gap-2">
              <h2>Theme</h2>
              <ThemeSwitch enabled={!!darkModeEnabled} />
            </div>
            <div className="flex flex-1 gap-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={darkModeEnabled ? "outline" : "default"}
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => toggleEnableMode()}
                >
                  <Palette className="h-4 w-4" />
                  {darkModeEnabled === undefined ? "Enable" : "Disable"}
                </Button>
              </div>
            </div>
            <div className="border-border flex flex-1 gap-2 overflow-hidden rounded-md border p-2">
              <Card className="overflow-wrap flex flex-1 flex-col items-start justify-between overflow-auto p-2">
                <CardHeader className="flex w-full flex-col items-start justify-between p-2">
                  <CardTitle>Colors</CardTitle>
                  <CardDescription>
                    Customize your color palette.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-wrap flex h-125 flex-1 flex-col gap-2 overflow-auto">
                    <FieldContent>
                      <FieldLabel>Primary Color</FieldLabel>
                      <FieldContent>
                        <TabsColorPicker />
                      </FieldContent>
                    </FieldContent>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}
