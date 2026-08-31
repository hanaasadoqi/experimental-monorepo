"use client"

import {
  IconButtonPreview,
  TypographyPreview,
  UiComponentPreview,
} from "./ui-component-preview"

export function Demo() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted p-4 sm:p-6 lg:p-12 dark:bg-background">
      <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-4">
          <TypographyPreview />
          <IconButtonPreview />
        </div>
        <UiComponentPreview />
      </div>
    </div>
  )
}
