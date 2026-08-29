import { describe, it, expect, beforeEach } from 'vitest'
import { render, renderHook } from '@testing-library/react'
import {
  AppearanceProvider,
  useAppearanceStore,
} from './appearance-provider'
import { createLocalStorageAppearanceAdapter } from '../persistence/local-storage-adapter'

describe('AppearanceProvider', () => {
  let adapter = createLocalStorageAppearanceAdapter()

  beforeEach(() => {
    localStorage.clear()
    adapter = createLocalStorageAppearanceAdapter()
  })

  it('renders children', () => {
    const { container } = render(
      <AppearanceProvider adapter={adapter}>
        <div>test content</div>
      </AppearanceProvider>
    )
    expect(container.textContent).toContain('test content')
  })

  it('provides store to context', () => {
    const { result } = renderHook(() => useAppearanceStore(), {
      wrapper: ({ children }) => (
        <AppearanceProvider adapter={adapter}>
          {children}
        </AppearanceProvider>
      ),
    })
    expect(result.current).toBeDefined()
    expect(result.current.getState).toBeDefined()
  })

  it('throws if useAppearanceStore used outside provider', () => {
    expect(() => {
      renderHook(() => useAppearanceStore())
    }).toThrow('must be used within an AppearanceProvider')
  })

  it('creates isolated stores for each provider', () => {
    const { result: store1 } = renderHook(() => useAppearanceStore(), {
      wrapper: ({ children }) => (
        <AppearanceProvider adapter={adapter} defaultPreference="light">
          {children}
        </AppearanceProvider>
      ),
    })

    const { result: store2 } = renderHook(() => useAppearanceStore(), {
      wrapper: ({ children }) => (
        <AppearanceProvider adapter={adapter} defaultPreference="dark">
          {children}
        </AppearanceProvider>
      ),
    })

    expect(store1.current).not.toBe(store2.current)
    expect(store1.current.getState().preference).toBe('light')
    expect(store2.current.getState().preference).toBe('dark')
  })

  it('uses initialPreference over defaultPreference', () => {
    const { result } = renderHook(() => useAppearanceStore(), {
      wrapper: ({ children }) => (
        <AppearanceProvider
          adapter={adapter}
          defaultPreference="light"
          initialPreference="dark"
        >
          {children}
        </AppearanceProvider>
      ),
    })
    expect(result.current.getState().preference).toBe('dark')
  })

  it('reads persisted preference from adapter', () => {
    adapter.write('dark')
    const { result } = renderHook(() => useAppearanceStore(), {
      wrapper: ({ children }) => (
        <AppearanceProvider adapter={adapter} defaultPreference="light">
          {children}
        </AppearanceProvider>
      ),
    })
    expect(result.current.getState().preference).toBe('dark')
  })
})
