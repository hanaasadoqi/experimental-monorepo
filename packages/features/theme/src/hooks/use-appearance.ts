"use client"

import { useCallback, useSyncExternalStore } from "react"
import { useAppearanceStore } from "../provider/appearance-provider"
import {
  AppearanceState,
  AppearancePreference,
  ResolvedColorScheme,
} from "../types"

export function useAppearance(): AppearanceState {
  const store = useAppearanceStore()
  return useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.getState()
  )
}

export function useAppearancePreference(): AppearancePreference {
  const store = useAppearanceStore()
  return useSyncExternalStore(
    (listener) => {
      let prevPreference = store.getState().preference
      return store.subscribe((state) => {
        if (state.preference !== prevPreference) {
          prevPreference = state.preference
          listener()
        }
      })
    },
    () => store.getState().preference
  )
}

export function useResolvedColorScheme(): ResolvedColorScheme {
  const store = useAppearanceStore()
  return useSyncExternalStore(
    (listener) => {
      let prevScheme = store.getState().resolvedColorScheme
      return store.subscribe((state) => {
        if (state.resolvedColorScheme !== prevScheme) {
          prevScheme = state.resolvedColorScheme
          listener()
        }
      })
    },
    () => store.getState().resolvedColorScheme
  )
}

export function useSetAppearancePreference(): (
  preference: AppearancePreference
) => void {
  const store = useAppearanceStore()
  return useCallback(
    (preference: AppearancePreference) => {
      store.getState().setPreference(preference)
    },
    [store]
  )
}

export function useAppearanceControl(): [
  preference: AppearancePreference,
  setPreference: (preference: AppearancePreference) => void,
] {
  const preference = useAppearancePreference()
  const setPreference = useSetAppearancePreference()
  return [preference, setPreference]
}
