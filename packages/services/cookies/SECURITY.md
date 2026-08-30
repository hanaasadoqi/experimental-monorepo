# Cookie security checklist

- Treat every cookie received from a client as untrusted input.
- Keep authentication/session cookie handling inside the chosen auth/session system.
- Prefer `HttpOnly` for session/credential cookies so client JavaScript cannot read them.
- Use `Secure` in production so sensitive cookies travel only over HTTPS.
- Choose `SameSite=Lax` or `Strict` intentionally; do not rely on browser defaults for security policy.
- `SameSite` is defense in depth, not universal CSRF protection.
- Avoid broad `Domain` attributes. Host-only cookies reduce cross-subdomain exposure.
- Use short, purpose-specific values rather than serializing large application state into cookies.
- Never trust a cookie merely because the application originally wrote it; validate/parse it on every trust boundary.
- Keep client preference/bootstrap cookies separate from authentication/session cookies.
