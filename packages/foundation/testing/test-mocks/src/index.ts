// Browser mocks
export {
  createMatchMedia,
  createMatchMediaMock,
  installBrowserMocks,
} from "./browser.js"

// Storage mocks
export type { MemoryStorage } from "./storage.js"

// Zustand fixtures
export type {
  BasicState,
  ComplexState,
  AsyncState,
  PersistedState,
  RequiredState,
  ActionState,
} from "./zustand.js"
export {
  basicStateCreator,
  complexStateCreator,
  asyncStateCreator,
} from "./zustand.js"

// Faker: Data factories for development
export {
  createFakeTheme,
  createFakeThemes,
  createFakeAppearancePreference,
  createFakeLanguagePreference,
  createFakeDateFormatPreference,
  createFakeTimeFormatPreference,
  createFakePreferences,
  createFakePreferencesBatch,
  createFakeUser,
  createFakeUsers,
  createFakeDevelopmentDataset,
  type FakeUser,
} from "./faker.js"

// Seeds: Idempotent seed data
export {
  SEED_IDS,
  getDefaultSeedThemes,
  getDefaultLightThemeSeed,
  getDefaultDarkThemeSeed,
  getDefaultSeedPreferences,
  getDefaultSeedUser,
  getDefaultSeedDataset,
  seedWithDatabase,
} from "./seeds.js"

// Mock responses: API response envelopes
export {
  createMockThemesResponse,
  createMockThemeResponse,
  createMockPreferencesResponse,
  createMockPreferencesUpdateResponse,
  createMockUserResponse,
  createMockUsersResponse,
  createMockDatasetResponse,
  createMockErrorResponse,
  createMockNotFoundResponse,
  type ApiSuccessResponse,
  type ApiErrorResponse,
  type ApiResponse,
} from "./mock-responses.js"
