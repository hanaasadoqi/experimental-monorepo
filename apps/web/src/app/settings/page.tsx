import { PreferencesForm } from "@repo/ui-preferences"

export const metadata = {
  title: "Settings",
  description: "Manage your preferences and customize your experience",
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <PreferencesForm />
    </div>
  )
}
