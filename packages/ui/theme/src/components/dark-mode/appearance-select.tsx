"use client"

import {
  type AppearancePreference,
  appearancePreferenceSchema,
} from "@repo/domain-preferences"

type AppearanceSelectProps = {
  preference: AppearancePreference
  setAppearance: (preference: AppearancePreference) => void
  onValidChange?: (preference: AppearancePreference) => void
}

export function AppearanceSelect({
  preference,
  setAppearance,
  onValidChange,
}: AppearanceSelectProps) {
  // const preference = useAppearancePreference()

  // const setAppearance = useSetAppearancePreference()

  function handleChange(value: string): void {
    const result = appearancePreferenceSchema.safeParse(value)

    if (!result.success) {
      return
    }

    setAppearance(result.data)
    onValidChange?.(result.data)
  }

  return (
    <select
      value={preference}
      onChange={(event) => {
        handleChange(event.target.value)
      }}
    >
      <option value="system">System</option>

      <option value="light">Light</option>

      <option value="dark">Dark</option>
    </select>
  )
}
