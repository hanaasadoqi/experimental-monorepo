# @repo/services-cookies

Typed cookie definitions and framework-neutral cookie access helpers.

This package treats cookies as a narrow request/response transport and bootstrap mechanism. It is **not** a persistence abstraction and intentionally does not expose `document.cookie`, Next.js APIs, auth/session implementations, or feature-owned cookie names.

## Why this exists

Cookie semantics differ from localStorage and database persistence. Cookies cross the HTTP boundary automatically and carry security/scoping attributes, so they deserve an explicit contract rather than pretending to be a generic key/value storage backend.

## Define a feature-owned cookie

```ts
import {
  defineCookie,
  enumCookieCodec,
} from "@repo/services-cookies"

export const appearanceCookie = defineCookie({
  name: "synapcity-appearance",
  codec: enumCookieCodec(["light", "dark", "system"] as const),
  options: {
    path: "/",
    sameSite: "lax",
    secure: true,
  },
})
```

The cookie definition belongs with the feature that owns the meaning of the value. The generic service only defines mechanics.

## Next.js adapter

Keep Next.js integration in the app boundary:

```ts
import { cookies } from "next/headers"
import { readCookie } from "@repo/services-cookies"
import { appearanceCookie } from "@repo/feature-preferences/server"

const store = await cookies()

const result = readCookie(
  {
    get: (name) => store.get(name)?.value,
  },
  appearanceCookie,
)
```

For writes, adapt a Server Action, Route Handler, or `NextResponse` at the call site rather than making this package depend on Next.js.

## Security boundary

Do not use this package to invent session management. Authentication/session libraries should own their session cookies and rotation semantics.

Do not store passwords, bearer tokens, refresh tokens, or other credentials in JavaScript-readable cookies or Web Storage.

Sensitive session cookies should generally be `HttpOnly`, `Secure`, scoped as narrowly as practical, and use an explicit `SameSite` policy. Prefer host-only cookies; do not add a broad `Domain` unless cross-subdomain sharing is actually required.
