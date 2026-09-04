"use client"

import { createContext, useContext } from 'react'
import { useThemeStore } from '@repo/runtime-theme/store'


const ThemeContext = createContext<{
  theme: 'light' | 'dark'
  toggleTheme: () => void
}>({
  theme: 'light',
  toggleTheme: () => {},
})

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useThemeStoreContext = () => useContext(ThemeContext)
