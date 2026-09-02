"use client"

import { createStoreHook } from "@repo/services-zustand/react"

import type { PreferencesStore } from "../store"

import { usePreferencesStoreApi } from "./preferences-context"

export const usePreferencesStore = createStoreHook<PreferencesStore>(
  usePreferencesStoreApi
)
