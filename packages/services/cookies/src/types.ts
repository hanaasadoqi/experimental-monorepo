export type CookieSameSite = "lax" | "strict" | "none"

export interface CookieOptions {
  path?: string
  domain?: string
  httpOnly?: boolean
  secure?: boolean
  sameSite?: CookieSameSite
  maxAge?: number
  expires?: Date
}

export interface CookieReader {
  get(name: string): string | undefined
}

export interface CookieWriter extends CookieReader {
  set(name: string, value: string, options?: CookieOptions): void
  delete(name: string, options?: Pick<CookieOptions, "path" | "domain">): void
}

export interface CookieCodec<T> {
  parse(raw: string): T
  serialize(value: T): string
}

export interface CookieDefinition<T> {
  readonly name: string
  readonly options: Readonly<CookieOptions>
  readonly codec: CookieCodec<T>

  parse(raw: string): T
  safeParse(raw?: string): T | undefined
  serialize(value: T): string
}
