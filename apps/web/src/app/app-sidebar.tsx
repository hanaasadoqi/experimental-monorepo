import { Home01Icon, PaintBoardIcon, Settings02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { SidebarHeader, SidebarSeparator, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarRail, Sidebar } from "@repo/ui-components"
import { SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, Sheet } from "@repo/ui-components/base/sheet"
import { ThemeForm } from "@repo/ui-theme"

const navigation = [
  { label: "Overview", icon: Home01Icon, href: "/" },
  { label: "Theme system", icon: PaintBoardIcon, href: "/" },
]


export const AppSidebar = () => {
  return (
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
            <SidebarMenu className="pl-0">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.label} className="w-full list-none pl-0">
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
  )
}