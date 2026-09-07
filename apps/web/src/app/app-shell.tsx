"use client"

import {
  Home01Icon,
  PaintBoardIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@repo/ui-components/base/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@repo/ui-components/base/sidebar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui-components/base/sheet"
import { ThemeForm } from "@repo/ui-theme"

const navigation = [
  { label: "Overview", icon: Home01Icon, href: "/" },
  { label: "Theme system", icon: PaintBoardIcon, href: "/" },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-3">
          <div className="flex items-center gap-3 px-1 group-data-[collapsible=icon]:justify-center">
            <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold">
              T
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold">Theme Studio</p>
              <p className="text-muted-foreground truncate text-xs">
                System workspace
              </p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      render={<a href={item.href} />}
                      tooltip={item.label}
                      isActive={item.label === "Theme system"}
                    >
                      <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Sheet>
                <SheetTrigger
                  render={
                    <SidebarMenuButton tooltip="Theme settings">
                      <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} />
                      <span>Theme settings</span>
                    </SidebarMenuButton>
                  }
                />
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
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
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
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </SidebarInset>
    </>
  )
}
