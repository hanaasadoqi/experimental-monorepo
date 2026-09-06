"use client"

import { createContext, useContext } from "react"
import { TooltipProvider } from "@repo/ui-components/base/tooltip"
import { SidebarProvider } from "@repo/ui-components/base/sidebar"

const ClientApplicationContext = createContext<{
  status: "idle" | "loading" | "error"
}>({
  status: "idle",
})

export const ClientApplicationProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <ClientApplicationContext.Provider value={{ status: "idle" }}>
      <TooltipProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </TooltipProvider>
    </ClientApplicationContext.Provider>
  )
}

export const useClientStore = () => useContext(ClientApplicationContext)
