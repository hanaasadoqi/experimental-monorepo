import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@workspace/ui",
    "@repo/ui-design-system",
    "@workspace/features-theme"
    // "@workspace/features-persistence"
  ],
  serverExternalPackages: [
    '@repo/service-cookies',
    "@repo/foundation-typescript-config",
    "@repo/foundation-eslint-config",
    "@repo/foundation-prettier-config",
    "@repo/foundation-vitest-config",
    "@repo/foundation-vitest-utils",
    "@repo/foundation-test-mocks"
  ],
  experimental: {
    optimizePackageImports: [
      "@hugeicons/core-free-icons",
      "@hugeicons/react",
      "@repo/domain-themes",

    ]
  }
}

export default nextConfig;

