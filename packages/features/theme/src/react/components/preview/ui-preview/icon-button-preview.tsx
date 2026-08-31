"use client"

import { Button } from "@repo/ui-components/base/button"
import { Card, CardContent } from "@repo/ui-components/base/card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CopyIcon,
  CircleAlert,
  TrashIcon,
  ShareIcon,
  ShoppingBagIcon,
  MoreHorizontalIcon,
  Loader,
  PlusIcon,
  MinusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
  SettingsIcon,
} from "@hugeicons/core-free-icons"

const ICON_BUTTONS = [
  CopyIcon,
  CircleAlert,
  TrashIcon,
  ShareIcon,
  ShoppingBagIcon,
  MoreHorizontalIcon,
  Loader,
  PlusIcon,
  MinusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
  SettingsIcon,
]

export function IconButtonPreview() {
  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-8 place-items-center gap-4">
          {ICON_BUTTONS.map((icon, index) => (
            <Card key={index} className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
              <Button variant="ghost" size="icon-lg">
                <HugeiconsIcon icon={icon} />
              </Button>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
