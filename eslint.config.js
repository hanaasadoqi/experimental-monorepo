// Root-level ESLint config for a Turborepo workspace.
// App/package lint rules live in each workspace's eslint.config.js.
// Using CommonJS to avoid module resolution issues at the root level.

module.exports = [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/.docs/**",
      "**/.archives/**",
      "**/.github/**",
      "**/.history/**",
      "**/.husky/**",
      "**/.remember/**",
      "**/.serena/**",
      "**/.DS_Store",
    ],
  },
]
