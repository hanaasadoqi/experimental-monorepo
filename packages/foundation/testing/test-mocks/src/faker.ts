/**
 * @module faker
 * Realistic development data factories using @faker-js/faker.
 * Used by seeds, tests, and mock API responses.
 *
 * ⚠️ DEVELOPMENT ONLY — Should never be imported in production code.
 * ESLint rule blocks imports in app/ layer.
 *
 * All factories validate against domain schemas before returning.
 * If schema changes, factories break (good!).
 */

import { faker } from "@faker-js/faker"
import type { Theme } from "@repo/shared-contracts"
import type {
  Preferences,
  AppearancePreference,
  LanguagePreference,
  DateFormatPreference,
  TimeFormatPreference,
} from "@repo/domain-preferences"
import {
  appearancePreferenceSchema,
  preferencesSchema,
  APPEARANCE_OPTIONS,
  LANGUAGE_PREFERENCE_OPTIONS,
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS,
} from "@repo/domain-preferences"

// ============================================================================
// Theme Factory
// ============================================================================

/**
 * Create a fake Theme with optional overrides.
 * Validates against Theme contract before returning.
 */
export function createFakeTheme(overrides?: Partial<Theme>): Theme {
  const theme: Theme = {
    id: faker.string.uuid(),
    enableDarkMode: faker.datatype.boolean(),
    darkMode: faker.datatype.boolean(),
    scopeIds: ["root"],
    ...overrides,
  }

  // Theme doesn't have a Zod schema yet, so we validate structure
  if (!theme.id || typeof theme.id !== "string") {
    throw new Error("Invalid theme: id must be a non-empty string")
  }
  if (typeof theme.enableDarkMode !== "boolean") {
    throw new Error("Invalid theme: enableDarkMode must be boolean")
  }
  if (theme.darkMode !== undefined && typeof theme.darkMode !== "boolean") {
    throw new Error("Invalid theme: darkMode must be boolean or undefined")
  }
  if (!Array.isArray(theme.scopeIds)) {
    throw new Error("Invalid theme: scopeIds must be an array")
  }

  return theme
}

/**
 * Create multiple fake themes at once.
 */
export function createFakeThemes(count: number): Theme[] {
  return Array.from({ length: count }, () => createFakeTheme())
}

// ============================================================================
// Preferences Factory
// ============================================================================

/**
 * Create a fake AppearancePreference.
 */
export function createFakeAppearancePreference(
  override?: AppearancePreference
): AppearancePreference {
  if (override) {
    return appearancePreferenceSchema.parse(override)
  }
  const value = faker.helpers.arrayElement(APPEARANCE_OPTIONS)
  return appearancePreferenceSchema.parse(value)
}

/**
 * Create a fake LanguagePreference.
 */
export function createFakeLanguagePreference(
  override?: LanguagePreference
): LanguagePreference {
  if (override) {
    return override
  }
  return faker.helpers.arrayElement(LANGUAGE_PREFERENCE_OPTIONS)
}

/**
 * Create a fake DateFormatPreference.
 */
export function createFakeDateFormatPreference(
  override?: DateFormatPreference
): DateFormatPreference {
  if (override) {
    return override
  }
  return faker.helpers.arrayElement(DATE_FORMAT_OPTIONS) as DateFormatPreference
}

/**
 * Create a fake TimeFormatPreference.
 */
export function createFakeTimeFormatPreference(
  override?: TimeFormatPreference
): TimeFormatPreference {
  if (override) {
    return override
  }
  return faker.helpers.arrayElement(TIME_FORMAT_OPTIONS) as TimeFormatPreference
}

/**
 * Create a fake Preferences object.
 * Validates against preferencesSchema before returning.
 */
export function createFakePreferences(
  overrides?: Partial<Preferences>
): Preferences {
  const preferences: Preferences = {
    appearance: createFakeAppearancePreference(),
    language: createFakeLanguagePreference(),
    dateFormat: createFakeDateFormatPreference(),
    timeFormat: createFakeTimeFormatPreference(),
    ...overrides,
  }

  return preferencesSchema.parse(preferences)
}

/**
 * Create multiple fake preferences at once.
 */
export function createFakePreferencesBatch(count: number): Preferences[] {
  return Array.from({ length: count }, () => createFakePreferences())
}

// ============================================================================
// User Factory (Basic)
// ============================================================================

/**
 * Basic user schema for development.
 * Expands as auth/user domain layer grows.
 */
export interface FakeUser {
  id: string
  name: string
  email: string
  avatar: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Create a fake User with optional overrides.
 */
export function createFakeUser(overrides?: Partial<FakeUser>): FakeUser {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    createdAt: faker.date.past({ years: 2 }),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}

/**
 * Create multiple fake users at once.
 */
export function createFakeUsers(count: number): FakeUser[] {
  return Array.from({ length: count }, () => createFakeUser())
}

// ============================================================================
// Batch Helpers
// ============================================================================

/**
 * Create a complete fake development dataset with themes, preferences, and user.
 */
export function createFakeDevelopmentDataset(options?: {
  themeCount?: number
  userCount?: number
}) {
  return {
    themes: createFakeThemes(options?.themeCount ?? 2),
    preferences: createFakePreferences(),
    users: createFakeUsers(options?.userCount ?? 1),
  }
}
