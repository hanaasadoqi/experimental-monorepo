import type {
  CookieAdapterOptions,
  PersistenceAdapter,
} from "@repo/shared-contracts/types"
import { PreferencesState } from "../types";


export type CookiePreferencesAdapterOptions = CookieAdapterOptions;
export type PreferencesPersistenceAdapter = PersistenceAdapter<PreferencesState>;
