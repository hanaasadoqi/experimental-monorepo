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
import {
  Card,
  CardContent,
  CardHeader,
} from "@repo/ui-components/base/card"
import { Checkbox } from "@repo/ui-components/base/checkbox"
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
import { HugeiconsIcon } from "@hugeicons/react"
import { SearchIcon } from "@hugeicons/core-free-icons"
import { SplitButtonDropdownMenu } from "./split-button-dropdown-menu"

export function UiComponentPreview() {
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
