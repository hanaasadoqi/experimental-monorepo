export type { AppearancePersistenceAdapter } from "./types"
export { APPEARANCE_PREFERENCES } from "./types"
export { createLocalStorageAppearanceAdapter } from "./local-storage-adapter"
export {
  createCookieAppearanceAdapter,
  type CookieAdapterOptions,
} from "./cookie-adapter"
