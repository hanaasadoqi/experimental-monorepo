import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@repo/ui-components",
    "@repo/ui-theme",
    "@repo/ui-design-system",
    "@repo/domain-theme",
  ],
  serverExternalPackages: [
    "@repo/services-cookies",
    "@repo/foundation-typescript-config",
    "@repo/foundation-eslint-config",
    "@repo/foundation-prettier-config",
    "@repo/foundation-vitest-config",
    "@repo/foundation-vitest-utils",
    "@repo/foundation-test-mocks",
  ],
  experimental: {
    optimizePackageImports: ["@hugeicons/core-free-icons", "@hugeicons/react"],
  },
}

export default nextConfig
