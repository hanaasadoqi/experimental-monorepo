"use client"

import * as React from "react"
import { ThemeProvider } from "../provider/theme-provider"
import { ThemeToggleHotkey } from "./theme-toggle-hotkey"
import { useTheme } from "../hooks";

interface ThemeWrapperProps {
  children: React.ReactNode
}

function ThemeWrapper({ children }: ThemeWrapperProps) {
  const theme = useTheme().theme;

  React.useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ThemeProvider defaultTheme="system">
      <ThemeToggleHotkey />
      {children}
    </ThemeProvider>
  )
}

export { ThemeWrapper, type ThemeWrapperProps }
