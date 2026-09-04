"use client";

import { ThemeScopeProvider } from "@repo/features-theme-react";

export const DemoProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeScopeProvider scopeId="demo" className="min-h-screen">
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-2xl font-bold">Demo</h1>
        <div className="flex flex-col gap-2">
          {children}
        </div>
      </div>
    </ThemeScopeProvider>
  )
}
