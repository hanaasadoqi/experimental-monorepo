/**
 * @module mock-responses
 * Mock API response payloads for development.
 *
 * Used by development-only API routes in apps/web/app/api/mock-*.
 * Wraps seed data in standard API response envelopes.
 *
 * ⚠️ DEVELOPMENT ONLY — Never ship in production.
 * Mock routes should be excluded from production builds.
 */

import {
  getDefaultSeedThemes,
  getDefaultSeedPreferences,
  getDefaultSeedUser,
  getDefaultSeedDataset,
} from "./seeds"
import type { Theme } from "@repo/shared-contracts"
import type { Preferences } from "@repo/domain-preferences"
import type { FakeUser } from "./faker"

// ============================================================================
// Response Envelope Types
// ============================================================================

/**
 * Standard API response envelope for successful responses.
 */
export interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta?: {
    timestamp: string
    version: string
  }
}

/**
 * Standard API response envelope for error responses.
 */
export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
  }
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// ============================================================================
// Theme Mock Responses
// ============================================================================

/**
 * Mock response for GET /api/mock/themes
 */
export function createMockThemesResponse(): ApiSuccessResponse<Theme[]> {
  return {
    success: true,
    data: getDefaultSeedThemes(),
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  }
}

/**
 * Mock response for GET /api/mock/themes/:id
 */
export function createMockThemeResponse(
  id?: string
): ApiSuccessResponse<Theme> {
  const themes = getDefaultSeedThemes()
  const theme = id ? themes.find((t) => t.id === id) : themes[0]

  if (!theme) {
    throw new Error(`Theme not found: ${id}`)
  }

  return {
    success: true,
    data: theme,
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  }
}

// ============================================================================
// Preferences Mock Responses
// ============================================================================

/**
 * Mock response for GET /api/mock/preferences
 */
export function createMockPreferencesResponse(): ApiSuccessResponse<Preferences> {
  return {
    success: true,
    data: getDefaultSeedPreferences(),
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  }
}

/**
 * Mock response for POST /api/mock/preferences
 * (Simulates update — returns the updated preferences)
 */
export function createMockPreferencesUpdateResponse(
  updates: Partial<Preferences>
): ApiSuccessResponse<Preferences> {
  return {
    success: true,
    data: {
      ...getDefaultSeedPreferences(),
      ...updates,
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  }
}

// ============================================================================
// User Mock Responses
// ============================================================================

/**
 * Mock response for GET /api/mock/user
 */
export function createMockUserResponse(): ApiSuccessResponse<FakeUser> {
  return {
    success: true,
    data: getDefaultSeedUser(),
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  }
}

/**
 * Mock response for GET /api/mock/users
 */
export function createMockUsersResponse(
  count: number = 5
): ApiSuccessResponse<FakeUser[]> {
  // For mock purposes, just return multiple copies with different IDs
  const users: FakeUser[] = Array.from({ length: count }, (_, i) => ({
    ...getDefaultSeedUser(),
    id: `seed:user:${i}`,
  }))

  return {
    success: true,
    data: users,
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  }
}

// ============================================================================
// Composite Mock Responses
// ============================================================================

/**
 * Mock response for GET /api/mock/data (complete dataset)
 * Used for initial app hydration or testing.
 */
export function createMockDatasetResponse(): ApiSuccessResponse<
  ReturnType<typeof getDefaultSeedDataset>
> {
  return {
    success: true,
    data: getDefaultSeedDataset(),
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  }
}

// ============================================================================
// Error Responses
// ============================================================================

/**
 * Create a standard error response.
 */
export function createMockErrorResponse(
  message: string,
  code?: string
): ApiErrorResponse {
  return {
    success: false,
    error: {
      message,
      code,
    },
  }
}

/**
 * Create a 404 Not Found response.
 */
export function createMockNotFoundResponse(resource: string): ApiErrorResponse {
  return createMockErrorResponse(`${resource} not found`, "NOT_FOUND")
}
