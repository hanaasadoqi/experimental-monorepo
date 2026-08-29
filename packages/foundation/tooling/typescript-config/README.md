# @workspace/typescript-config

Owns strict compiler baselines for environment-neutral libraries, React libraries, and Next.js applications. Each consumer extends the narrowest suitable public config and keeps package-specific `include`, path, and environment types local.

The repository invokes TypeScript 7 through `typescript-native`; the literal `typescript` package remains a compatibility API for framework tools until their TypeScript 7 integration is complete.
