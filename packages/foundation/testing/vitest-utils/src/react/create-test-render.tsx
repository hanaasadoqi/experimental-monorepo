import { render } from "@testing-library/react"
import type { RenderResult } from "@testing-library/react"
import type { ReactElement, ReactNode } from "react"
import type {
  TestProviderWrapper,
  TestRender,
  TestRenderOptions,
} from "./types.js"

export function createTestRender<TProviders = undefined>(
  wrap: TestProviderWrapper<TProviders>
): TestRender<TProviders> {
  return function renderWithTestProviders(
    ui: ReactElement,
    { providers, ...options }: TestRenderOptions<TProviders> = {}
  ): RenderResult {
    return render(ui, {
      wrapper: ({ children }: { children: ReactNode }): ReactElement =>
        wrap(children, providers),
      ...options,
    })
  }
}
