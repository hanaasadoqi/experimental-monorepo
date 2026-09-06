import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@repo/ui-components",
    "@repo/ui-theme",
    "@repo/ui-design-system",
    "@repo/domain-theme",
  ],
  serverExternalPackages: ["@repo/services-cookies"],
  experimental: {
    optimizePackageImports: ["@hugeicons/core-free-icons", "@hugeicons/react"],
  },
}

export default nextConfig
