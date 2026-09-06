"use client"

import { LanguageForm } from "./language-form"
import { DateTimeForm } from "./date-time-form"
import { ExportImportSection } from "./export-import-section"
import { useState } from "react"
import {
  Bell,
  Palette,
  Globe,
  Clock,
  Moon,
  Sun,
  Monitor,
  Eye,
  Lock,
  Database,
  Download,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui-components/base/card"
import { Input } from "@repo/ui-components/base/input"
import { Label } from "@repo/ui-components/base/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui-components/base/select"
import { Separator } from "@repo/ui-components/base/separator"
import { Switch } from "@repo/ui-components/base/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui-components/base/tabs"
import {
  useAppearancePreference,
  useSetAppearancePreference,
  useLanguagePreference,
  useSetLanguagePreference,
  useDateFormatPreference,
  useSetDateFormatPreference,
  useTimeFormatPreference,
  useSetTimeFormatPreference,
  usePreferences,
} from "@repo/runtime-preferences"

interface SettingsFormData {
  // Display Options
  compactMode: boolean
  showBorders: boolean
  animationsEnabled: boolean

  // Notifications
  emailNotifications: boolean
  pushNotifications: boolean
  soundEnabled: boolean

  // Privacy & Security
  twoFactorAuth: boolean
  activityLogging: boolean

  // Data Management
  autoSave: boolean
  autoSaveInterval: string
}

export function PreferencesForm() {
  // Preference hooks (managed by Zustand store)
  const appearance = useAppearancePreference()
  const setAppearance = useSetAppearancePreference()
  const language = useLanguagePreference()
  const setLanguage = useSetLanguagePreference()
  const dateFormat = useDateFormatPreference()
  const setDateFormat = useSetDateFormatPreference()
  const timeFormat = useTimeFormatPreference()
  const setTimeFormat = useSetTimeFormatPreference()
  const allPreferences = usePreferences()

  // Local UI state (not persisted preferences)
  const [settings, setSettings] = useState<SettingsFormData>({
    compactMode: false,
    showBorders: true,
    animationsEnabled: true,
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: false,
    twoFactorAuth: false,
    activityLogging: true,
    autoSave: true,
    autoSaveInterval: "30",
  })

  const handleImportPreferences = (imported: Partial<typeof allPreferences>) => {
    if (imported.appearance !== undefined)
      setAppearance(imported.appearance as Parameters<typeof setAppearance>[0])
    if (imported.language !== undefined)
      setLanguage(imported.language as Parameters<typeof setLanguage>[0])
    if (imported.dateFormat !== undefined)
      setDateFormat(imported.dateFormat as Parameters<typeof setDateFormat>[0])
    if (imported.timeFormat !== undefined)
      setTimeFormat(imported.timeFormat as Parameters<typeof setTimeFormat>[0])
  }

  const handleLanguageChange = (newLanguage: string | null) => {
    if (newLanguage) setLanguage(newLanguage as Parameters<typeof setLanguage>[0])
  }

  const handleAppearanceChange = (newAppearance: string | null) => {
    if (newAppearance)
      setAppearance(newAppearance as Parameters<typeof setAppearance>[0])
  }

  const handleDateFormatChange = (newDateFormat: string | null) => {
    if (newDateFormat)
      setDateFormat(newDateFormat as Parameters<typeof setDateFormat>[0])
  }

  const handleTimeFormatChange = (newTimeFormat: string | null) => {
    if (newTimeFormat)
      setTimeFormat(newTimeFormat as Parameters<typeof setTimeFormat>[0])
  }

  const handleToggle = (key: string) => {
    if (typeof settings[key as keyof SettingsFormData] === "boolean") {
      setSettings({
        ...settings,
        [key]: !settings[key as keyof SettingsFormData],
      })
    }
  }

  const handleInputChange = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value })
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your preferences and customize your experience
        </p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-7 mb-8">
          <TabsTrigger value="appearance" className="gap-2">
            <HugeiconsIcon icon={Palette} className="size-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="gap-2">
            <HugeiconsIcon icon={Globe} className="size-4" />
            <span className="hidden sm:inline">Language</span>
          </TabsTrigger>
          <TabsTrigger value="date-time" className="gap-2">
            <HugeiconsIcon icon={Clock} className="size-4" />
            <span className="hidden sm:inline">Date & Time</span>
          </TabsTrigger>
          <TabsTrigger value="display" className="gap-2">
            <HugeiconsIcon icon={Eye} className="size-4" />
            <span className="hidden sm:inline">Display</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <HugeiconsIcon icon={Bell} className="size-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <HugeiconsIcon icon={Lock} className="size-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="gap-2">
            <HugeiconsIcon icon={Download} className="size-4" />
            <span className="hidden sm:inline">Backup</span>
          </TabsTrigger>
        </TabsList>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Selection */}
              <div>
                <Label htmlFor="theme" className="mb-2 block">
                  Theme
                </Label>
                <Select value={appearance} onValueChange={handleAppearanceChange}>
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <HugeiconsIcon icon={Sun} className="size-4 mr-2" />
                      Light
                    </SelectItem>
                    <SelectItem value="dark">
                      <HugeiconsIcon icon={Moon} className="size-4 mr-2" />
                      Dark
                    </SelectItem>
                    <SelectItem value="system">
                      <HugeiconsIcon icon={Monitor} className="size-4 mr-2" />
                      System Default
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Tab */}
        <TabsContent value="language">
          <LanguageForm
            language={language}
            handleLanguageChange={handleLanguageChange}
          />
        </TabsContent>

        {/* Date & Time Tab */}
        <TabsContent value="date-time">
          <DateTimeForm
            dateFormat={dateFormat}
            timeFormat={timeFormat}
            handleDateFormatChange={handleDateFormatChange}
            handleTimeFormatChange={handleTimeFormatChange}
          />
        </TabsContent>

        {/* Display Tab */}
        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Display Options</CardTitle>
              <CardDescription>Adjust how content is displayed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Compact Mode */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div>
                  <Label
                    htmlFor="compact-mode"
                    className="font-semibold text-base"
                  >
                    Compact Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce spacing between elements
                  </p>
                </div>
                <Switch
                  id="compact-mode"
                  checked={settings.compactMode}
                  onCheckedChange={() => handleToggle("compactMode")}
                />
              </div>

              <Separator />

              {/* Show Borders */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div>
                  <Label
                    htmlFor="show-borders"
                    className="font-semibold text-base"
                  >
                    Show Component Borders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Highlight component boundaries
                  </p>
                </div>
                <Switch
                  id="show-borders"
                  checked={settings.showBorders}
                  onCheckedChange={() => handleToggle("showBorders")}
                />
              </div>

              <Separator />

              {/* Animations */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div>
                  <Label
                    htmlFor="animations"
                    className="font-semibold text-base"
                  >
                    Enable Animations
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Smooth transitions and effects
                  </p>
                </div>
                <Switch
                  id="animations"
                  checked={settings.animationsEnabled}
                  onCheckedChange={() => handleToggle("animationsEnabled")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications & Alerts</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div>
                  <Label
                    htmlFor="email-notif"
                    className="font-semibold text-base"
                  >
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  id="email-notif"
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleToggle("emailNotifications")}
                />
              </div>

              <Separator />

              {/* Push Notifications */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div>
                  <Label
                    htmlFor="push-notif"
                    className="font-semibold text-base"
                  >
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive browser notifications
                  </p>
                </div>
                <Switch
                  id="push-notif"
                  checked={settings.pushNotifications}
                  onCheckedChange={() => handleToggle("pushNotifications")}
                />
              </div>

              <Separator />

              {/* Sound Enabled */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div>
                  <Label
                    htmlFor="sound-notif"
                    className="font-semibold text-base"
                  >
                    Sound Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound when notifications arrive
                  </p>
                </div>
                <Switch
                  id="sound-notif"
                  checked={settings.soundEnabled}
                  onCheckedChange={() => handleToggle("soundEnabled")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy & Security Tab */}
        <TabsContent value="privacy">
          <div className="space-y-6">
            {/* Privacy Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>
                  Manage your account security and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Two Factor Auth */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div>
                    <Label htmlFor="2fa" className="font-semibold text-base">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security
                    </p>
                  </div>
                  <Switch
                    id="2fa"
                    checked={settings.twoFactorAuth}
                    onCheckedChange={() => handleToggle("twoFactorAuth")}
                  />
                </div>

                <Separator />

                {/* Activity Logging */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div>
                    <Label
                      htmlFor="activity-log"
                      className="font-semibold text-base"
                    >
                      Activity Logging
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Keep track of account activity
                    </p>
                  </div>
                  <Switch
                    id="activity-log"
                    checked={settings.activityLogging}
                    onCheckedChange={() => handleToggle("activityLogging")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Management Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={Database} className="size-5" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Control how your data is handled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Auto Save */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div>
                    <Label
                      htmlFor="auto-save"
                      className="font-semibold text-base"
                    >
                      Auto-Save
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save your work
                    </p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={settings.autoSave}
                    onCheckedChange={() => handleToggle("autoSave")}
                  />
                </div>

                {settings.autoSave && (
                  <>
                    <Separator />

                    {/* Auto Save Interval */}
                    <div>
                      <Label
                        htmlFor="auto-save-interval"
                        className="mb-2 block"
                      >
                        Auto-Save Interval (seconds)
                      </Label>
                      <Input
                        id="auto-save-interval"
                        type="number"
                        min="10"
                        max="300"
                        value={settings.autoSaveInterval}
                        onChange={(e) =>
                          handleInputChange("autoSaveInterval", e.target.value)
                        }
                        className="max-w-xs"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Data will be saved every {settings.autoSaveInterval}{" "}
                        seconds
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Backup & Restore Tab */}
        <TabsContent value="backup">
          <ExportImportSection
            preferences={allPreferences}
            onImport={handleImportPreferences}
          />
        </TabsContent>
      </Tabs>

      {/* Save Notice */}
      <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Note:</span> Changes
          are automatically saved to your profile
        </p>
      </div>
    </div>
  )
}
