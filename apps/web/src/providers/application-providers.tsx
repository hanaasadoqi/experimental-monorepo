/**
 * Root application providers: theme, preferences, and appearance resolution.
 *
 * ARCHITECTURE OVERVIEW
 * ====================
 *
 * This module composes the three foundational provider layers:
 *
 * 1. PreferencesProvider (domain-preferences + runtime-preferences)
 *    - Global preferences state (dark mode enabled, custom colors, etc.)
 *    - Initializes from `initialPreferences` prop
 *    - Synced to server via PreferencesPersistence
 *
 * 2. RootThemeScope (runtime-theme scope system)
 *    - Wraps the app with theme compilation pipeline
 *    - Watches appearance resolution and syncs to store via setGlobalDarkMode
 *    - Calls compile() automatically on scope state changes
 *    - Applies CSS variables to document.documentElement
 *
 * 3. AppearanceBridge (preference signal → system appearance resolution)
 *    - Listens to preference changes (user toggled dark mode, etc.)
 *    - Resolves final appearance (light/dark/system) to concrete value
 *    - Broadcasts resolved appearance via useResolvedAppearance hook
 *
 * DATA FLOW DURING INITIALIZATION
 * ==============================
 *
 * On app start:
 * 1. PreferencesProvider loads preferences (undefined initially)
 * 2. AppearanceBridge resolves system appearance (via matchMedia) → 'light' or 'dark'
 * 3. RootThemeScope watches appearance, syncs to store via setGlobalDarkMode
 * 4. ThemeScopeProvider compiles theme with DEFAULT_PRIMARY_COLOR + resolved appearance
 * 5. Compiled CSS variables applied to DOM
 * 6. User preferences hydrate from localStorage/cookies (async, via PreferencesPersistence)
 * 7. If user saved custom primary color, recompile triggered via scope subscription
 *
 * STORE HYDRATION (Zustand in runtime-theme)
 * =========================================
 *
 * The theme store has two initialization paths:
 *
 * a) FIRST RENDER (no persisted state):
 *    - Store initializes with default color
 *    - Compilation happens immediately
 *    - No recompilation until user changes preference
 *
 * b) SUBSEQUENT RENDERS (with persisted state from localStorage):
 *    - Store hydrates via persist middleware (if available)
 *    - If hydrated state has custom primary, recompile triggered
 *    - CSS variables updated to reflect saved preferences
 *
 * STORAGE AVAILABILITY HANDLING
 * ============================
 *
 * localStorage is tested because:
 * - Private/incognito mode may throw on access
 * - Some browsers limit or disable it
 * - localStorage quota may be exceeded
 * - This test ensures graceful degradation to memory-only storage
 *
 * The getStorage function is scoped to ApplicationProviders to keep
 * SSR-safe (window check prevents access during server render).
 *
 * @client This component must be used client-side ("use client" directive)
 */

"use client"

import { useEffect, type ReactNode } from "react"

import { PreferencesProvider } from "@repo/runtime-preferences"
import type { Preferences } from "@repo/domain-preferences"
import { ThemeScopeProvider, useThemeStore } from "@repo/runtime-theme"
import { applyAppearanceToDocument } from "@repo/adapters-theme-browser"
import { DEFAULT_PRIMARY_COLOR } from "@repo/domain-theme/colors"

import { AppearanceBridge } from "./appearance-bridge"
import { useResolvedAppearance } from "../hooks/use-resolved-appearance"

import { PreferencesPersistence } from "../preferences/preferences-persistence"
import { ClientApplicationProvider } from "./client-application-providers"
// import { ThemeToggleHotkey } from "@repo/ui-theme/components"
export interface ApplicationProvidersProps {
  children: ReactNode
  initialPreferences?: Partial<Preferences>
}

/**
 * Root theme scope wrapper that bridges appearance resolution to theme store.
 *
 * Responsibilities:
 * 1. Watch resolved appearance (from AppearanceBridge via useResolvedAppearance)
 * 2. Sync appearance to store via setGlobalDarkMode when enabled
 * 3. Initialize theme with DEFAULT_PRIMARY_COLOR (ensures first render has valid color)
 * 4. Wrap children with ThemeScopeProvider (handles compilation and CSS variable injection)
 *
 * Why separate component?
 * - Must call useResolvedAppearance (requires AppearanceBridge parent)
 * - Must read/write theme store (requires context setup order)
 * - Wrapping children with ThemeScopeProvider must be inside preferences context
 *
 * @param children Child components to render inside theme scope
 */
function RootThemeScope({ children }: { children: ReactNode }) {
  const resolvedAppearance = useResolvedAppearance()
  const theme = useThemeStore((state) => state.getGlobalTheme())
  const setGlobalDarkMode = useThemeStore((state) => state.setGlobalDarkMode)

  useEffect(() => {
    if (!theme.enableDarkMode) return
    setGlobalDarkMode(resolvedAppearance === "dark")
  }, [resolvedAppearance, setGlobalDarkMode, theme.enableDarkMode])

  return (
    <ThemeScopeProvider
      scopeId="root"
      theme={theme}
      resolvedAppearance={resolvedAppearance}
      followResolvedAppearance
      applyResolvedAppearance={applyAppearanceToDocument}
      initialOverrides={{ primary: DEFAULT_PRIMARY_COLOR }}
    >
      {children}
    </ThemeScopeProvider>
  )
}

/**
 * Root application providers component.
 *
 * Composes all foundational providers needed for the app to run:
 * - ClientApplicationProvider: Framework-specific setup
 * - PreferencesProvider: Global preferences state (dark mode, custom colors, etc.)
 * - RootThemeScope: Theme compilation and appearance resolution
 * - AppearanceBridge: System appearance detection (light/dark)
 * - PreferencesPersistence: Sync preferences to server/localStorage
 *
 * @param children Components to render inside all providers
 * @param initialPreferences Optional initial preferences to hydrate the state
 * @returns Provider composition wrapping children
 */
export function ApplicationProviders({
  children,
  initialPreferences,
}: ApplicationProvidersProps) {
  // Lazy-load localStorage only in browser to avoid SSR issues
  const _getStorage = () => {
    if (typeof window === "undefined") return undefined
    try {
      // Test if localStorage is actually available (private mode, quota exceeded, disabled, etc.)
      const test = "__storage_test__"
      window.localStorage.setItem(test, test)
      window.localStorage.removeItem(test)
      return window.localStorage
    } catch {
      // Fall back to memory-only storage if localStorage is unavailable
      return undefined
    }
  }

  return (
    <ClientApplicationProvider>
      <PreferencesProvider initialPreferences={initialPreferences}>
        <RootThemeScope>
          <PreferencesPersistence />
          <AppearanceBridge>{children}</AppearanceBridge>
        </RootThemeScope>
      </PreferencesProvider>
    </ClientApplicationProvider>
  )
}
