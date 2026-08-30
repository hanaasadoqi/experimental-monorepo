// features/theme/src/react/appearance/appearance-select.tsx

"use client"

import {
  appearancePreferenceSchema,
  useAppearancePreference,
  useSetAppearancePreference,
} from "@repo/feature-preferences"

export function AppearanceSelect() {
  const preference =
    useAppearancePreference()

  const setAppearance =
    useSetAppearancePreference()

  function handleChange(
    value: string,
  ): void {
    const result =
      appearancePreferenceSchema.safeParse(
        value,
      )

    if (!result.success) {
      return
    }

    setAppearance(result.data)
  }

  return (
    <select
      value={preference}
      onChange={(event) => {
        handleChange(
          event.target.value,
        )
      }}
    >
      <option value="system">
        System
      </option>

      <option value="light">
        Light
      </option>

      <option value="dark">
        Dark
      </option>
    </select>
  )
}
