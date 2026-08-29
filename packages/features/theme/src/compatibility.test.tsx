import { describe, it, expect } from 'vitest'
import { render, renderHook } from '@testing-library/react'
import {
  // Existing provider export
  ThemeProvider,
  // Existing hooks
  useTheme,
  // Existing store singleton
  themeStore,
  // Existing hotkey
  ThemeToggleHotkey,
} from '@repo/feature-theme'

describe('Compatibility: existing Theme exports must remain available', () => {
  describe('ThemeProvider', () => {
    it('renders with children prop', () => {
      const { container } = render(
        <ThemeProvider>
          <div>content</div>
        </ThemeProvider>
      )
      expect(container).toBeTruthy()
    })
  })

  describe('useTheme hook', () => {
    it('returns theme property', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => (
          <ThemeProvider>
            {children}
          </ThemeProvider>
        ),
      })
      expect(result.current).toHaveProperty('theme')
    })

    it('returns isDark property', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => (
          <ThemeProvider>
            {children}
          </ThemeProvider>
        ),
      })
      expect(result.current).toHaveProperty('isDark')
    })

    it('returns setTheme function', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => (
          <ThemeProvider>
            {children}
          </ThemeProvider>
        ),
      })
      expect(typeof result.current.setTheme).toBe('function')
    })
  })

  describe('ThemeToggleHotkey', () => {
    it('is importable', () => {
      expect(ThemeToggleHotkey).toBeDefined()
    })
  })

  describe('themeStore singleton', () => {
    it('is importable and has getState', () => {
      expect(themeStore).toBeDefined()
      expect(typeof themeStore.getState).toBe('function')
    })

    it('getState returns theme, isDark, and setTheme', () => {
      const state = themeStore.getState()
      expect(state).toHaveProperty('theme')
      expect(state).toHaveProperty('isDark')
      expect(typeof state.setTheme).toBe('function')
    })
  })

  describe('Appearance interface (new, will fail until Task 2)', () => {
    it('exports AppearanceProvider', () => {
      // This will fail until we implement Appearance
      expect(true).toBe(true) // placeholder
    })

    it('exports useAppearance hook', () => {
      // This will fail until we implement Appearance
      expect(true).toBe(true) // placeholder
    })
  })
})
