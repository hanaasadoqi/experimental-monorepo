"use client"

import * as React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui-components/base/alert-dialog"
import { Badge } from "@repo/ui-components/base/badge"
import { Button } from "@repo/ui-components/base/button"
import { ButtonGroup } from "@repo/ui-components/base/button-group"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui-components/base/card"
import { Checkbox } from "@repo/ui-components/base/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui-components/base/dropdown-menu"
import { Field, FieldGroup } from "@repo/ui-components/base/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@repo/ui-components/base/input-group"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@repo/ui-components/base/item"
import {
  RadioGroup,
  RadioGroupItem,
} from "@repo/ui-components/base/radio-group"
import { Slider } from "@repo/ui-components/base/slider"
import { Switch } from "@repo/ui-components/base/switch"
import { Textarea } from "@repo/ui-components/base/textarea"
import { ChevronUpIcon } from "@hugeicons/core-free-icons"
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

export const UiComponentPreview = () => {
  const [sliderValue, setSliderValue] = React.useState<number[]>([500])
  const handleSliderValueChange = React.useCallback(
    (value: number | readonly number[]) => {
      if (typeof value === "number") {
        setSliderValue([value])
      } else {
        setSliderValue([...value])
      }
    },
    []
  )
  return (
    <div className="flex flex-col gap-4">
      <Card className="w-full">
        <CardContent className="flex flex-col gap-6">
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            <Item variant="outline">
              <ItemContent>
                <ItemTitle>Two-factor authentication</ItemTitle>
                <ItemDescription className="text-pretty xl:hidden 2xl:block">
                  Verify via email or phone number.
                </ItemDescription>
              </ItemContent>
              <ItemActions className="hidden md:flex">
                <Button size="sm" variant="secondary">
                  Enable
                </Button>
              </ItemActions>
            </Item>
          </CardHeader>
          <Slider
            value={sliderValue}
            onValueChange={handleSliderValueChange}
            max={1000}
            min={0}
            step={10}
            className="flex-1"
            aria-label="Slider"
          />
          <FieldGroup>
            <Field>
              <InputGroup>
                <InputGroupInput placeholder="Name" />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>
                    <HugeiconsIcon icon={SearchIcon} />
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Field className="flex-1">
              <Textarea placeholder="Message" className="resize-none" />
            </Field>
          </FieldGroup>
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <Badge>Badge</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <RadioGroup
              defaultValue="apple"
              className="ml-auto flex w-fit gap-3"
            >
              <RadioGroupItem value="apple" />
              <RadioGroupItem value="banana" />
            </RadioGroup>
            <div className="flex gap-3">
              <Checkbox defaultChecked />
              <Checkbox />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="outline">
                    <span className="hidden md:block">Alert Dialog</span>
                    <span className="block md:hidden">Dialog</span>
                  </Button>
                }
              />
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Allow accessory to connect?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Do you want to allow the USB accessory to connect to this
                    device and your data?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Don&apos;t allow</AlertDialogCancel>
                  <AlertDialogAction>Allow</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <SplitButtonDropdownMenu />
            <Switch defaultChecked className="ml-auto" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const SplitButtonDropdownMenu = () => {
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

export const IconButtonPreview = () => {
  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-8 place-items-center gap-4">
          <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
            <Button variant="ghost" size="icon-lg">
              <HugeiconsIcon icon={CopyIcon} />
            </Button>
          </Card>
          <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
            <Button variant="ghost" size="icon-lg">
              <HugeiconsIcon icon={CircleAlert} />
            </Button>
          </Card>
          <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
            <Button variant="ghost" size="icon-lg">
              <HugeiconsIcon icon={TrashIcon} />
            </Button>
          </Card>
          <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
            <Button variant="ghost" size="icon-lg">
              <HugeiconsIcon icon={ShareIcon} />
            </Button>
          </Card>
          <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
            <Button variant="ghost" size="icon-lg">
              <HugeiconsIcon icon={ShoppingBagIcon} />
            </Button>
          </Card>
          <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
            <Button variant="ghost" size="icon-lg">
              <HugeiconsIcon icon={MoreHorizontalIcon} />
            </Button>
          </Card>
          <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
            <Button variant="ghost" size="icon-lg">
              <HugeiconsIcon icon={Loader} />
            </Button>
          </Card>
          <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
            <Button variant="ghost" size="icon-lg">
              <HugeiconsIcon icon={PlusIcon} />
            </Button>
          </Card>
          <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
            <Button variant="ghost" size="icon-lg">
              <HugeiconsIcon icon={MinusIcon} />
            </Button>
          </Card>
          <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
            <Button variant="ghost" size="icon-lg">
              <HugeiconsIcon icon={ArrowLeftIcon} />
            </Button>
          </Card>
          <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
            <Button variant="ghost" size="icon-lg">
              <HugeiconsIcon icon={ArrowRightIcon} />
            </Button>
          </Card>
          <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
            <Button variant="ghost" size="icon-lg">
              <HugeiconsIcon icon={CheckIcon} />
            </Button>
          </Card>
          <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
            <Button variant="ghost" size="icon-lg">
              <HugeiconsIcon icon={ChevronDownIcon} />
            </Button>
          </Card>
          <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
            <Button variant="ghost" size="icon-lg">
              <HugeiconsIcon icon={ChevronRightIcon} />
            </Button>
          </Card>
          <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
            <Button variant="ghost" size="icon-lg">
              <HugeiconsIcon icon={SearchIcon} />
            </Button>
          </Card>
          <Card className="flex size-8 items-center justify-center p-0 shadow-none *:[svg]:size-4">
            <Button variant="ghost" size="icon-lg">
              <HugeiconsIcon icon={SettingsIcon} />
            </Button>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

export const TypographyPreview = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Style Overview</CardTitle>
        <CardDescription className="line-clamp-2">
          Designers love packing quirky glyphs into test phrases. This is a
          preview of the typography styles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-3">
          {[
            "--background",
            "--foreground",
            "--primary",
            "--secondary",
            "--muted",
            "--accent",
            "--border",
            "--chart-1",
            "--chart-2",
            "--chart-3",
            "--chart-4",
            "--chart-5",
          ].map((variant) => (
            <div
              key={variant}
              className="flex flex-col flex-wrap items-center gap-2"
            >
              <div
                className="relative aspect-square w-full rounded-lg bg-(--color) after:absolute after:inset-0 after:rounded-lg after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten"
                style={
                  {
                    "--color": `var(${variant})`,
                  } as React.CSSProperties
                }
              />
              <div className="hidden max-w-14 truncate font-mono text-[0.60rem] md:block">
                {variant}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
