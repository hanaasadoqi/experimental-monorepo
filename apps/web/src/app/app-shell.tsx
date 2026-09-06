"use client"

import { Button } from "@repo/ui-components/base/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@repo/ui-components/base/sheet"
import { ThemeForm } from "@repo/ui-theme"

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-foreground flex min-h-screen w-full flex-col">
      <Sheet>
        <SheetTrigger render={<Button>Open Theme</Button>} />
        <SheetContent>
          <ThemeForm />
        </SheetContent>
      </Sheet>
      {children}
    </div>
  )
}
