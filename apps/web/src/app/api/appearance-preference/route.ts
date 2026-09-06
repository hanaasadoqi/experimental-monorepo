import { writeAppearanceCookie } from "@repo/adapters-theme-next/server"
import { appearancePreferenceSchema } from "@repo/domain-preferences/appearance"

const requestBodySchema = appearancePreferenceSchema.transform(
  (preference) => ({
    preference,
  })
)

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const result = requestBodySchema.safeParse(
      typeof body === "object" && body !== null && "preference" in body
        ? body.preference
        : undefined
    )

    if (!result.success) {
      return Response.json(
        { error: "Invalid preference value" },
        { status: 400 }
      )
    }

    await writeAppearanceCookie(result.data.preference)

    return Response.json({ ok: true })
  } catch (error) {
    console.error("Error in appearance preference API route:", error)
    return Response.json(
      { error: "Failed to update preference" },
      { status: 500 }
    )
  }
}
