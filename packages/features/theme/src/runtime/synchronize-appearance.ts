import type { StoreApi } from "zustand"

import { applyColorScheme, getAppliedColorScheme } from "./apply-color-scheme"
import { resolveColorScheme } from "./resolve-color-scheme"
import type { AppearancePersistenceAdapter } from "../persistence/types"
import type { AppearanceState } from "../types"

const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)"

function readSystemMatches(): boolean {
  try {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return false
    }
    return window.matchMedia(DARK_MEDIA_QUERY).matches
  } catch {
    return false
  }
}

/**
 * Mounts the synchronization lifecycle that keeps the appearance store,
 * system color-scheme preference, persistence adapter, and DOM all in sync.
 *
 * This is the single source of DOM updates: consumers (e.g. Task 6's React
 * wrapper) must call this once per mount and rely on it exclusively rather
 * than applying DOM changes themselves.
 *
 * Responsibilities:
 * 1. Applies the initial DOM state from the current store preference.
 * 2. Subscribes to store changes: updates the DOM and persists preference
 *    changes via the adapter.
 * 3. Subscribes to system media changes: updates the DOM (and the store's
 *    `resolvedColorScheme`) only while the preference is `'system'`.
 * 4. Subscribes to adapter changes (e.g. another tab): updates the store
 *    without writing back to the adapter, avoiding a feedback loop.
 *
 * Returns an idempotent disposer that unsubscribes every listener.
 */
export function synchronizeAppearance(
  store: StoreApi<AppearanceState>,
  adapter: AppearancePersistenceAdapter,
  element: HTMLElement
): () => void {
  let systemMatches = readSystemMatches()
  let isApplyingExternalChange = false
  let disposed = false

  /**
   * The single place that derives a resolved color scheme from current
   * state and writes it to the DOM (and, if it drifted, back into the
   * store). All three DOM properties are always updated together via
   * `applyColorScheme`, so they can never disagree.
   */
  function syncDom(): void {
    if (disposed) {
      return
    }

    const { preference, resolvedColorScheme } = store.getState()
    const scheme = resolveColorScheme(preference, systemMatches)

    applyColorScheme(element, scheme)

    if (scheme !== resolvedColorScheme) {
      store.setState({ resolvedColorScheme: scheme })
    }
  }

  // 1. Initialize: apply current store preference to DOM and sync resolved scheme.
  const { preference, resolvedColorScheme } = store.getState()
  const initialScheme = resolveColorScheme(preference, systemMatches)
  applyColorScheme(element, initialScheme)
  if (initialScheme !== resolvedColorScheme) {
    store.setState({ resolvedColorScheme: initialScheme })
  }

  // 2. Subscribe to store changes: update DOM, persist via adapter.
  const unsubscribeStore = store.subscribe((state, previousState) => {
    syncDom()

    if (
      !isApplyingExternalChange &&
      state.preference !== previousState.preference
    ) {
      adapter.write(state.preference)
    }
  })

  // 3. Subscribe to system media changes: update DOM only if preference is
  // 'system'.
  let mediaQuery: MediaQueryList | null = null
  let handleMediaChange: ((event: MediaQueryListEvent) => void) | null = null

  try {
    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function"
    ) {
      mediaQuery = window.matchMedia(DARK_MEDIA_QUERY)
      handleMediaChange = (event: MediaQueryListEvent): void => {
        systemMatches = event.matches
        if (store.getState().preference === "system") {
          syncDom()
        }
      }
      mediaQuery.addEventListener("change", handleMediaChange)
    }
  } catch {
    mediaQuery = null
    handleMediaChange = null
  }

  // 4. Subscribe to adapter changes: update store without writing back.
  const unsubscribeAdapter = adapter.subscribe((preference) => {
    if (disposed) {
      return
    }

    isApplyingExternalChange = true
    try {
      store.setState({
        preference,
        resolvedColorScheme: resolveColorScheme(preference, systemMatches),
      })
    } finally {
      isApplyingExternalChange = false
    }
  })

  // 5. Idempotent disposer that cleans up all listeners.
  return function dispose(): void {
    if (disposed) {
      return
    }
    disposed = true

    unsubscribeStore()
    unsubscribeAdapter()

    if (mediaQuery && handleMediaChange) {
      mediaQuery.removeEventListener("change", handleMediaChange)
    }
  }
}
