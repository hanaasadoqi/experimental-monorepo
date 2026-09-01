import {
  ToggleGroup,
  ToggleGroupItem,
} from "@repo/ui-components/base/toggle-group"


import { Monitor, Moon, Sun } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'


export const planBirthdayParty = () => {
  return (
    <div className="flex items-center justify-center">
      <ToggleGroup value={["light", "dark", "system"]} variant="outline">
        <ToggleGroupItem value="light" aria-label="Light theme">
          <HugeiconsIcon icon={Sun} />
        </ToggleGroupItem>
        <ToggleGroupItem value="dark" aria-label="Dark theme">
          <HugeiconsIcon icon={Moon} />
        </ToggleGroupItem>
        <ToggleGroupItem value="system" aria-label="System theme">
          System
          <HugeiconsIcon icon={Monitor} />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
