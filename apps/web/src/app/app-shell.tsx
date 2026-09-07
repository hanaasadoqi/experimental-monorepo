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
import { AppContentHeader } from "./app-content-header"
import { AppSidebar } from "./app-sidebar"

// const navigation = [
//   { label: "Overview", icon: Home01Icon, href: "/" },
//   { label: "Theme system", icon: PaintBoardIcon, href: "/" },
// ]

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <div className="flex min-h-0 flex-1 flex-col">
          <AppContentHeader />
          {children}
        </div>
      </SidebarInset>
    </>
  )
}
