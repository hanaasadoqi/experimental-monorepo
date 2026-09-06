"use client"

import { useRef, useState } from "react"
import { Download, Upload } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui-components/base/card"
import { Button } from "@repo/ui-components/base/button"
import { Label } from "@repo/ui-components/base/label"
import { Separator } from "@repo/ui-components/base/separator"
import {
  exportPreferences,
  importPreferences,
  generateExportFilename,
  type Preferences,
} from "@repo/domain-preferences"

export interface ExportImportSectionProps {
  preferences: Preferences
  onImport: (preferences: Partial<Preferences>) => void
}

export function ExportImportSection({
  preferences,
  onImport,
}: ExportImportSectionProps) {
  const [importMessage, setImportMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const json = exportPreferences(preferences)
    const filename = generateExportFilename()
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const result = importPreferences(text)

      if (result.success && result.preferences) {
        onImport(result.preferences)
        setImportMessage({
          type: "success",
          text: "Preferences imported successfully",
        })
        setTimeout(() => setImportMessage(null), 3000)
      } else {
        setImportMessage({
          type: "error",
          text: result.error || "Failed to import preferences",
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      setImportMessage({
        type: "error",
        text: `Failed to read file: ${message}`,
      })
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup & Restore</CardTitle>
        <CardDescription>
          Export your preferences as a file or import from a previously saved
          file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export */}
        <div>
          <Label className="font-semibold text-base mb-2 block">
            Export Preferences
          </Label>
          <p className="text-sm text-muted-foreground mb-4">
            Download your preferences as a JSON file for backup or transfer to
            another device
          </p>
          <Button
            onClick={handleExport}
            variant="outline"
            className="gap-2"
          >
            <HugeiconsIcon icon={Download} className="size-4" />
            Export as JSON
          </Button>
        </div>

        <Separator />

        {/* Import */}
        <div>
          <Label className="font-semibold text-base mb-2 block">
            Import Preferences
          </Label>
          <p className="text-sm text-muted-foreground mb-4">
            Restore preferences from a previously exported JSON file
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="gap-2"
          >
            <HugeiconsIcon icon={Upload} className="size-4" />
            Import from File
          </Button>

          {importMessage && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                importMessage.type === "success"
                  ? "bg-green-50 text-green-900 border border-green-200"
                  : "bg-red-50 text-red-900 border border-red-200"
              }`}
            >
              {importMessage.text}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
