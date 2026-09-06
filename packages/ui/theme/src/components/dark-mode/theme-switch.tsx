"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useId } from "react"
import { Switch } from "@repo/ui-components/base/switch"
import { useThemeScope } from "@repo/runtime-theme"

const ThemeSwitch = ({ enabled }: { enabled: boolean }) => {
  const id = useId()
  const { enableDarkMode, isDarkMode, setDarkMode } = useThemeScope()

  const handleChange = (value: boolean) => {
    setDarkMode(value)
  }

  return (
    <div className="inline-flex items-center gap-2">
      <MoonIcon className="size-4 text-muted-foreground" />
      <Switch
        disabled={!enabled || !enableDarkMode}
        checked={isDarkMode ?? false}
        className="h-5 w-9 rounded-sm [&_span]:size-4 [&_span]:rounded"
        id={id}
        onCheckedChange={handleChange}
      />
      <SunIcon className="size-4" />
    </div>
  )
}

export default ThemeSwitch
