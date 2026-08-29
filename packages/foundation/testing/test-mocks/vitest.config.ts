import { mergeConfig } from 'vitest/config'

import { baseConfig } from '@foundation/tooling-vitest-config/base'

export default mergeConfig(baseConfig, {
  test: {
    include: ['src/**/*.test.ts'],
  },
})
