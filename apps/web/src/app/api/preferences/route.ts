import { writePreferencesCookie } from "@repo/adapters-next"
import {
  appearancePreferenceSchema,
  languagePreferenceSchema,
  dateFormatPreferenceSchema,
  timeFormatPreferenceSchema,
} from "@repo/domain-preferences"
import { z } from "zod"

/**
 * Preferences API endpoint — unified sync for all preference types.
 *
 * Accepts partial updates (only specified fields are persisted to cookies).
 * appearance and language are persisted via cookies.
 * dateFormat and timeFormat are client-only (localStorage).
 */
const requestBodySchema = z.object({
  appearance: appearancePreferenceSchema.optional(),
  language: languagePreferenceSchema.optional(),
  dateFormat: dateFormatPreferenceSchema.optional(),
  timeFormat: timeFormatPreferenceSchema.optional(),
})

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const result = requestBodySchema.safeParse(body)

    if (!result.success) {
      console.warn("Invalid preferences request:", result.error.issues)
      return Response.json(
        {
          error: "Invalid preference format",
          issues: result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      )
    }

    // Write cookie preferences (appearance + language)
    const writeResult = await writePreferencesCookie({
      appearance: result.data.appearance,
      language: result.data.language,
    })

    if (!writeResult.success) {
      console.error("Failed to write preferences cookie:", writeResult.error)
      return Response.json(
        { error: "Failed to save preferences" },
        { status: 500 }
      )
    }

    // dateFormat and timeFormat are client-only (localStorage handled by Zustand)
    // They're validated but not persisted server-side
    return Response.json({ ok: true })
  } catch (error) {
    console.error("Error in preferences API route:", error)
    return Response.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    )
  }
}
