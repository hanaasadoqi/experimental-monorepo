import { render, type RenderOptions, type RenderResult } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'

export type TestRenderOptions<TProviders = undefined> = Omit<RenderOptions, 'wrapper'> & {
  providers?: TProviders
}

export type TestRender<TProviders = undefined> = (
  ui: ReactElement,
  options?: TestRenderOptions<TProviders>,
) => RenderResult

export type TestProviderWrapper<TProviders = undefined> = (
  children: ReactNode,
  providers: TProviders | undefined,
) => ReactElement

export function createTestRender<TProviders = undefined>(
  wrap: TestProviderWrapper<TProviders>,
): TestRender<TProviders> {
  return function renderWithTestProviders(
    ui: ReactElement,
    { providers, ...options }: TestRenderOptions<TProviders> = {},
  ): RenderResult {
    return render(ui, {
      wrapper: ({ children }: { children: ReactNode }): ReactElement => wrap(children, providers),
      ...options,
    })
  }
}

export const renderUi = createTestRender((children) => <>{children}</>)
