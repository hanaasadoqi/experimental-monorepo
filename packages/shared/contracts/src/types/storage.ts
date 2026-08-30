
type SameSiteOptions = "Strict" | "Lax" | "None"

interface PersistenceAdapter<T = unknown> {
  read?(key: string): Promise<T | null>;
  write?(key: string, value: T): Promise<void>;
  delete?(key: string): Promise<void>;
  clear?(): Promise<void>;
  subscribe?(key: string, listener: (value: T | null) => void): () => void;
}

interface PersistenceConfig {
  key: string
  adapter: PersistenceAdapter
  version?: number
  migrate?: (state: unknown, version: number) => unknown
  partialPersist?: (state: unknown) => Partial<unknown>
}

interface CookieAdapterOptions {
  name?: string
  maxAge?: number
  path?: string
  sameSite?: SameSiteOptions;
  secure?: boolean
}


export type { PersistenceAdapter, PersistenceConfig, CookieAdapterOptions, SameSiteOptions }
