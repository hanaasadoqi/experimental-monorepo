# @repo/adapters-next

Next.js-specific preferences adapter — server cookie I/O.

**Server-only functions.**

## What's inside

### Cookie Read/Write

```typescript
import {
  readPreferencesCookie, // read cookies from request
  writePreferencesCookie, // write cookies to response
  clearAppearanceCookie,
  clearLanguageCookie,
  clearAllPreferencesCookies,
} from "@repo/adapters-next"

// In layout or RSC
const { appearance, language } = await readPreferencesCookie()

// In API route
const result = await writePreferencesCookie({
  appearance: "dark",
  language: "en",
})
```

## Architecture

Bridges domain preferences to Next.js cookie API:

- Validates all preferences with Zod schemas
- Handles cookie lifecycle (name, max-age, sameSite, secure)
- Provides typed read/write functions

## Usage

### Server Component (Layout)

```typescript
// app/layout.tsx
import { readPreferencesCookie } from "@repo/adapters-next"
import { PreferencesProvider } from "@repo/runtime-preferences"

export default async function RootLayout({ children }) {
  const prefs = await readPreferencesCookie()

  return (
    <PreferencesProvider initialPreferences={prefs}>
      {children}
    </PreferencesProvider>
  )
}
```

### API Route

```typescript
// app/api/preferences/route.ts
import { writePreferencesCookie } from "@repo/adapters-next"

export async function POST(request: Request) {
  const body = await request.json()

  const result = await writePreferencesCookie({
    appearance: body.appearance,
    language: body.language,
  })

  if (!result.success) {
    return Response.json({ error: result.error }, { status: 500 })
  }

  return Response.json({ ok: true })
}
```

## Cookie Names & Options

Preferences persisted as cookies:

- **appearance** → `appearance=dark` (HTTPOnly: false, SameSite: lax)
- **language** → `language=en` (HTTPOnly: false, SameSite: lax)

Non-persisted (client-only):

- **dateFormat** → client localStorage only
- **timeFormat** → client localStorage only

Max-age: 1 year (365.25 days)  
Secure: production only  
Path: /

## Related

- `@repo/domain-preferences` — types, schemas, validation
- `@repo/runtime-preferences` — Zustand store + React hooks
- `@repo/ui-preferences` — UI components
