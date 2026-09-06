export const APPEARANCE_COOKIE_NAME = "appearance"

/**
 * Cookie max age: 1 year (accounting for leap year average).
 * Using 365.25 days to account for leap years over multi-year spans.
 */
export const APPEARANCE_COOKIE_MAX_AGE = Math.round(60 * 60 * 24 * 365.25)
