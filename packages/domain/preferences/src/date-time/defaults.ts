// Explicit defaults to avoid array index fragility
export const DEFAULT_TIME_FORMAT = "12h" as const
export const DEFAULT_DATE_FORMAT = "mm/dd/yyyy" as const

export const TIME_FORMAT_DISPLAY_OPTIONS = [
  { value: "12h" as const, label: "12-hour (2:30 PM)" },
  { value: "24h" as const, label: "24-hour (14:30)" },
] as const

export const TIME_FORMAT_OPTIONS = TIME_FORMAT_DISPLAY_OPTIONS.map(
  (option) => option.value
) as [string, ...string[]]

export const DATE_FORMAT_DISPLAY_OPTIONS = [
  { value: "mm/dd/yyyy" as const, label: "MM/DD/YYYY" },
  { value: "dd/mm/yyyy" as const, label: "DD/MM/YYYY" },
  { value: "yyyy-mm-dd" as const, label: "YYYY-MM-DD" },
] as const

export const DATE_FORMAT_OPTIONS = DATE_FORMAT_DISPLAY_OPTIONS.map(
  (option) => option.value
) as [string, ...string[]]

// Validate that defaults exist in options
if (!DATE_FORMAT_OPTIONS.includes(DEFAULT_DATE_FORMAT)) {
  throw new Error("DEFAULT_DATE_FORMAT not in DATE_FORMAT_OPTIONS")
}
if (!TIME_FORMAT_OPTIONS.includes(DEFAULT_TIME_FORMAT)) {
  throw new Error("DEFAULT_TIME_FORMAT not in TIME_FORMAT_OPTIONS")
}
