import { DEFAULT_APPEARANCE_PREFERENCE } from "../appearance"
import { DEFAULT_LANGUAGE_PREFERENCE } from "../language"
import { DEFAULT_DATE_FORMAT, DEFAULT_TIME_FORMAT } from "../date-time"
import type { Preferences } from "./model"

export const DEFAULT_PREFERENCES: Preferences = {
  appearance: DEFAULT_APPEARANCE_PREFERENCE,
  language: DEFAULT_LANGUAGE_PREFERENCE,
  dateFormat: DEFAULT_DATE_FORMAT,
  timeFormat: DEFAULT_TIME_FORMAT,
}
