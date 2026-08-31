"use client"

import { Button } from "@repo/ui-components/base/button"
import { ButtonGroup } from "@repo/ui-components/base/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui-components/base/dropdown-menu"
import { ChevronUpIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function SplitButtonDropdownMenu() {
  return (
    <ButtonGroup>
      <Button variant="outline">Button Group</Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="icon">
              <HugeiconsIcon icon={ChevronUpIcon} />
            </Button>
          }
        />
        <DropdownMenuContent align="end" side="top" className="w-fit">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
            <DropdownMenuItem>Mute Conversation</DropdownMenuItem>
            <DropdownMenuItem>Mark as Read</DropdownMenuItem>
            <DropdownMenuItem>Block User</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Conversation</DropdownMenuLabel>
            <DropdownMenuItem>Share Conversation</DropdownMenuItem>
            <DropdownMenuItem>Copy Conversation</DropdownMenuItem>
            <DropdownMenuItem>Report Conversation</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive">
              Delete Conversation
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}
