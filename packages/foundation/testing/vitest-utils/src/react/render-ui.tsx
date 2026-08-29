import type { ReactNode } from "react"
import { createTestRender } from "./create-test-render.tsx"

export const renderUi = createTestRender((children: ReactNode) => (
  <>{children}</>
))
