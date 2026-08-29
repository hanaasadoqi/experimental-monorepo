import { ReactNode, useEffect } from "react"

import { themeStore } from "../store/theme-store"

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: "light" | "dark" | "system"
}

export const ThemeProvider = ({
  children,
  defaultTheme = "system",
}: ThemeProviderProps): ReactNode => {
  useEffect(() => {
    const state = themeStore.getState()

    if (state.theme === "system") {
      state.setTheme(defaultTheme)
    }

    const applyTheme = (theme: string) => {
      const isDark =
        theme === "dark" ||
        (theme === "system" &&
          window.matchMedia?.("(prefers-color-scheme: dark)").matches)

      const html = document.documentElement
      if (isDark) {
        html.classList.add("dark")
      } else {
        html.classList.remove("dark")
      }
    }

    const currentTheme = state.theme
    applyTheme(currentTheme)

    const unsubscribe = themeStore.subscribe((newState) => {
      applyTheme(newState.theme)
    })

    return () => unsubscribe()
  }, [defaultTheme])

  return <>{children}</>
}
