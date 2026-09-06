import { z } from "zod"
import {
  DATE_FORMAT_OPTIONS,
  DEFAULT_DATE_FORMAT,
  TIME_FORMAT_OPTIONS,
  DEFAULT_TIME_FORMAT,
} from "./defaults"

export const timeFormatPreferenceSchema = z
  .enum(TIME_FORMAT_OPTIONS as [string, ...string[]])
  .default(DEFAULT_TIME_FORMAT)

export type TimeFormatPreference = z.infer<typeof timeFormatPreferenceSchema>

export const dateFormatPreferenceSchema = z
  .enum(DATE_FORMAT_OPTIONS as [string, ...string[]])
  .default(DEFAULT_DATE_FORMAT)

export type DateFormatPreference = z.infer<typeof dateFormatPreferenceSchema>
