"use client"

import {
  useRef,
  type ReactNode,
} from "react"

import type {
  AppearancePreference,
} from "../model"

import {
  createPreferencesStore,
  type PreferencesStoreApi,
} from "../store"

import {
  PreferencesStoreContext,
} from "./preferences-context"

export interface PreferencesProviderProps {
  children: ReactNode
  initialAppearance?: AppearancePreference
}

export function PreferencesProvider({
  children,
  initialAppearance,
}: PreferencesProviderProps) {
  const storeRef =
    useRef<PreferencesStoreApi | null>(
      null
    )

  if (storeRef.current === null) {
    storeRef.current =
      createPreferencesStore({
        initialState:
          initialAppearance === undefined
            ? undefined
            : {
              appearance:
                initialAppearance,
            },
      })
  }

  return (
    <PreferencesStoreContext
      value={storeRef.current}
    >
      {children}
    </PreferencesStoreContext>
  )
}
