"use client";

import { useThemeScopeStore } from "@repo/features-theme-react";
import { DemoProviders } from "./demo-providers";
import { DemoShell } from "./demo-shell";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoProviders>
      <DemoShell>{children}</DemoShell>
    </DemoProviders>
  )
}
