import { useSyncExternalStore } from "react"
import {
  detectSystemAppearance,
  subscribeToSystemAppearanceChanges,
  type AppearanceEnvironment,
} from "./browser-appearance-environment"

/**
 * Hook for system appearance using useSyncExternalStore.
 * Handles subscription and hydration automatically.
 * Server always returns "light" to prevent hydration mismatch.
 *
 * @returns Current system appearance preference (light or dark)
 */
export function useSystemAppearance(): AppearanceEnvironment {
  return useSyncExternalStore(
    subscribeToSystemAppearanceChanges,
    detectSystemAppearance,
    // Server snapshot: always return "light" to prevent hydration mismatch
    // The bootstrap script will handle the correct theme on client
    () => "light"
  )
}
