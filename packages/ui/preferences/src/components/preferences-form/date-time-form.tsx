"use client"

import {
  DATE_FORMAT_DISPLAY_OPTIONS,
  TIME_FORMAT_DISPLAY_OPTIONS,
} from "@repo/domain-preferences"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui-components"
import { Label } from "@repo/ui-components/base/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui-components/base/select"
import { Separator } from "@repo/ui-components/base/separator"

export const DateTimeForm = ({
  dateFormat,
  timeFormat,
  handleDateFormatChange,
  handleTimeFormatChange,
}: {
  dateFormat: string
  timeFormat: string
  handleDateFormatChange: (value: string | null) => void
  handleTimeFormatChange: (value: string | null) => void
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Date & Time</CardTitle>
        <CardDescription>
          Set your preferred date and time formats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Time Format */}
        <div>
          <Label htmlFor="time-format" className="mb-2 block">
            Time Format
          </Label>
          <Select value={timeFormat} onValueChange={handleTimeFormatChange}>
            <SelectTrigger id="time-format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_FORMAT_DISPLAY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Date Format */}
        <div>
          <Label htmlFor="date-format" className="mb-2 block">
            Date Format
          </Label>
          <Select value={dateFormat} onValueChange={handleDateFormatChange}>
            <SelectTrigger id="date-format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_FORMAT_DISPLAY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
