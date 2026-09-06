"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useId } from "react"
import { Switch } from "@repo/ui-components/base/switch"
import { useThemeScopeStore } from "@repo/features-theme-react"

const ThemeSwitch = ({ enabled }: { enabled: boolean }) => {
  const id = useId()
  const store = useThemeScopeStore()
  const handleChange = (value: boolean) => {
    store.getState().setDarkMode(value)
  }

  const isDarkModeEnabled = store.getState().isDarkModeEnabled
  const darkMode = !isDarkModeEnabled

  return (
    <div className="inline-flex items-center gap-2">
      <MoonIcon className="size-4 text-muted-foreground" />
      <Switch
        disabled={!enabled}
        checked={darkMode}
        className="h-5 w-9 rounded-sm [&_span]:size-4 [&_span]:rounded"
        id={id}
        onCheckedChange={() => handleChange(!darkMode)}
      />
      <SunIcon className="size-4" />
    </div>
  )
}

export default ThemeSwitch
