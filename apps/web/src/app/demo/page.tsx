"use client"

import { TabsColorPicker } from "@/components";
import { Form } from "@base-ui/react";
import { ScopedThemeToggle } from "@repo/features-theme-react";
import { useThemeStore } from "@repo/runtime-theme";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui-components/base";
import { FieldContent, FieldLabel } from "@repo/ui-components/base/field";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@repo/ui-components/base/hover-card";
import { ThemeToggleHotkey, UiComponentShowcase } from "@repo/ui-theme";
import { BoxesIcon, Palette } from "lucide-react";
import { useRef } from "react";

export default function Demo() {
  const { isDarkModeEnabled: darkModeEnabled, theme, toggleEnableMode, toggleTheme } = useThemeStore()

  // => ( )
  // {
  // darkModeEnabled: state.isDarkModeEnabled,
  // toggleEnableMode: state.toggleEnableMode,
  // }),);

  const formRef = useRef<HTMLFormElement>(null);

// const darkModeComponent = darkModeEnabled ? <ScopedThemeToggle /> : (
//   <div className="flex items-center gap-2">
//     <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => toggleEnableMode()}>
//       <Palette className="h-4 w-4" />
//       {darkModeEnabled === undefined ? "Enable" : "Disable"}
//     </Button>
//   </div>
// )

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 w-full">
      <div className="flex flex-col gap-2 items-center justify-center w-full">
      <h1 className="text-2xl font-bold">Demo</h1>
        <HoverCard>
          <HoverCardTrigger>
            <BoxesIcon className="h-4 w-4" />
          </HoverCardTrigger>
          <HoverCardContent className="w-90">
            <div className="flex flex-col gap-2 flex-1 overflow-wrap overflow-auto h-125">
              <UiComponentShowcase />
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      <div className="flex flex-col gap-2">

        <Form ref={formRef}>
          <div className="flex flex-col gap-2 flex-1 overflow-wrap overflow-auto">
            <div className="flex justify-between gap-2 flex-1 overflow-wrap overflow-auto">
              <h2>Theme</h2>
              <ThemeToggleHotkey resolvedAppearance={theme} onAppearanceChange={() => toggleTheme()} />
              <div className="flex flex-wrap gap-2">
                <Button variant={darkModeEnabled ? "outline" : "default"} size="sm" className="flex items-center gap-2" onClick={() => toggleEnableMode()}>
                  <Palette className="h-4 w-4" />
                  {darkModeEnabled === undefined ? "Enable" : "Disable"}
                </Button>
              </div>
            </div>
            <div className="flex gap-2 flex-1 overflow-hidden border border-border rounded-md p-2">
              <Card className="flex flex-col justify-between items-start p-2 flex-1 overflow-wrap overflow-auto">
                <CardHeader className="flex flex-col justify-between items-start p-2 w-full">
                  <CardTitle>Colors</CardTitle>
                  <CardDescription>Customize your color palette.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2 flex-1 overflow-wrap overflow-auto h-125">
                    <FieldContent>
                      <FieldLabel>Primary Color</FieldLabel>
                      <FieldContent><TabsColorPicker /></FieldContent>
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
