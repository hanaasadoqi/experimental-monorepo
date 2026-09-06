import { nextJsConfig } from "@repo/foundation-eslint-config/next-js"

const webConfig = [
  ...nextJsConfig,
  {
    ignores: ["src/components/quarantine/**"],
  },
]

export default webConfig
