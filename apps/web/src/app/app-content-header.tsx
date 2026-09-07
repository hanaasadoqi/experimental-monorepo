import { Button } from "@repo/ui-components/base/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@repo/ui-components/base/sheet"
import { SidebarTrigger, SidebarSeparator } from "@repo/ui-components/base/sidebar";
import { ThemeForm } from "@repo/ui-theme"

export const AppContentHeader = () => {
  return (
    <header className="bg-background/90 supports-[backdrop-filter]:bg-background/75 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur-md">
      <SidebarTrigger />
      <SidebarSeparator orientation="vertical" className="h-4" />
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <p className="truncate text-sm font-medium">Theme system</p>
        <Sheet>
          <SheetTrigger render={<Button variant="outline" size="sm" />}>
            Configure
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Theme settings</SheetTitle>
              <SheetDescription>
                Tune the appearance of this workspace.
              </SheetDescription>
            </SheetHeader>
            <div className="px-4">
              <ThemeForm />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}