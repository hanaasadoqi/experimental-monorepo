import type { Preferences } from "@repo/domain-preferences"

/**
 * Sync preference changes to server API.
 * Only syncs appearance and language (cookie-persisted fields).
 * dateFormat and timeFormat stay client-only.
 */
export async function syncPreferencesToServer(
  preferences: Partial<Preferences>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appearance: preferences.appearance,
        language: preferences.language,
        // dateFormat and timeFormat omitted (client-only)
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.error || "Failed to sync preferences",
      }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Failed to sync preferences to server:", message)
    return { success: false, error: message }
  }
}
