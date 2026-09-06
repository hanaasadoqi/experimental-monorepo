"use client"

import { languageDisplayOptions } from "@repo/domain-preferences"
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

export const LanguageForm = ({
  language,
  handleLanguageChange,
}: {
  language: string
  handleLanguageChange: (value: string | null) => void
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Language & Localization</CardTitle>
        <CardDescription>Set your preferred language</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language Selection */}
        <div>
          <Label htmlFor="language" className="mb-2 block">
            Language
          </Label>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(languageDisplayOptions).map(([key, option]) => (
                <SelectItem key={key} value={key}>
                  {option.label} {option.flag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
