/**
 * @module seeds
 * Idempotent seed data initialization for development.
 *
 * Used by:
 * - App boot (to initialize Zustand stores)
 * - Database seeding scripts (later, with Prisma)
 * - Mock API responses
 *
 * All seed IDs are stable and intentional — running seeds twice
 * produces the same state (idempotent), not cumulative growth.
 */

import {
  createFakeTheme,
  createFakePreferences,
  createFakeUser,
  type FakeUser,
} from "./faker"
import type { Theme } from "@repo/shared-contracts"
import type { Preferences } from "@repo/domain-preferences"

// ============================================================================
// Stable Seed IDs (Idempotency)
// ============================================================================

/**
 * Intentional, non-random IDs for seed data.
 * Using these ensures: seeding twice = same state (not duplicates).
 *
 * When Prisma is integrated, these IDs become upsert keys.
 */
export const SEED_IDS = {
  // Themes
  LIGHT_THEME: "seed:theme:light",
  DARK_THEME: "seed:theme:dark",
  AUTO_THEME: "seed:theme:auto",

  // User
  DEFAULT_USER: "seed:user:default",

  // Preferences
  DEFAULT_PREFS: "seed:prefs:default",
}

// ============================================================================
// Theme Seeds
// ============================================================================

/**
 * Get default seed themes (light, dark, auto variants).
 * Always returns the same themes with stable IDs.
 *
 * Idempotent: calling multiple times returns identical structure.
 */
export function getDefaultSeedThemes(): Theme[] {
  return [
    createFakeTheme({
      id: SEED_IDS.LIGHT_THEME,
      enableDarkMode: true,
      isDarkMode: false,
      scopeIds: ["root"],
    }),
    createFakeTheme({
      id: SEED_IDS.DARK_THEME,
      enableDarkMode: true,
      isDarkMode: true,
      scopeIds: ["root"],
    }),
    createFakeTheme({
      id: SEED_IDS.AUTO_THEME,
      enableDarkMode: true,
      isDarkMode: undefined, // Initialized from appearance when first enabled
      scopeIds: ["root"],
    }),
  ]
}

/**
 * Get a single light theme seed.
 */
export function getDefaultLightThemeSeed(): Theme {
  return getDefaultSeedThemes()[0]!
}

/**
 * Get a single dark theme seed.
 */
export function getDefaultDarkThemeSeed(): Theme {
  return getDefaultSeedThemes()[1]!
}

// ============================================================================
// Preferences Seeds
// ============================================================================

/**
 * Get default seed preferences.
 * Idempotent: always returns the same values.
 */
export function getDefaultSeedPreferences(): Preferences {
  return createFakePreferences({
    appearance: "system",
    language: "en",
    dateFormat: "mm/dd/yyyy",
    timeFormat: "12h",
  })
}

// ============================================================================
// User Seeds
// ============================================================================

/**
 * Get default seed user (for testing, local dev, etc).
 * Idempotent: always returns the same user with stable ID, avatar, and dates.
 */
export function getDefaultSeedUser(): FakeUser {
  return createFakeUser({
    id: SEED_IDS.DEFAULT_USER,
    name: "Dev User",
    email: "dev@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dev-user&scale=80",
    // Fixed dates for reproducibility
    createdAt: new Date("2025-01-01T00:00:00Z"),
    updatedAt: new Date("2025-01-01T00:00:00Z"),
  })
}

// ============================================================================
// Complete Dataset
// ============================================================================

/**
 * Get complete seed dataset (all themes, preferences, user).
 * For initialization on app boot or in mock API responses.
 *
 * Idempotent: always returns the same complete state.
 */
export function getDefaultSeedDataset() {
  return {
    themes: getDefaultSeedThemes(),
    preferences: getDefaultSeedPreferences(),
    user: getDefaultSeedUser(),
  }
}

// ============================================================================
// Future: Prisma Seed Orchestrator
// ============================================================================

/**
 * Placeholder for Prisma seed orchestration (when DB is set up).
 *
 * Usage:
 * ```
 * const prisma = new PrismaClient()
 * await seedWithDatabase(prisma)
 * ```
 *
 * Will use upsert + stable IDs to ensure idempotency:
 * ```typescript
 * await prisma.theme.upsert({
 *   where: { id: SEED_IDS.LIGHT_THEME },
 *   update: {},
 *   create: getDefaultLightThemeSeed(),
 * })
 * ```
 */
export async function seedWithDatabase(_prisma: unknown): Promise<void> {
  // TODO: Implement when Prisma schema is ready
  throw new Error(
    "Database seeding not yet implemented. Set up Prisma schema first."
  )
}
