import type { RenderOptions, RenderResult } from "@testing-library/react"
import type { ReactElement, ReactNode } from "react"

export type TestRenderOptions<TProviders = undefined> = Omit<
  RenderOptions,
  "wrapper"
> & {
  providers?: TProviders
}

export type TestRender<TProviders = undefined> = (
  ui: ReactElement,
  options?: TestRenderOptions<TProviders>
) => RenderResult

export type TestProviderWrapper<TProviders = undefined> = (
  children: ReactNode,
  providers: TProviders | undefined
) => ReactElement
