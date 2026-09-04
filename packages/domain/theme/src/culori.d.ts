// Intentionally empty. `@types/culori` (a real devDependency) provides
// accurate, strict types for this package. A prior permissive ambient
// override here shadowed those real types within this package's own
// TypeScript program, letting conversion-call type errors pass
// package-locally while downstream consumers (which don't include this
// file) correctly caught them — see
// .archives/domain-theme/2026-09-04-culori-ambient-override/ARCHIVE.md.
export {}
