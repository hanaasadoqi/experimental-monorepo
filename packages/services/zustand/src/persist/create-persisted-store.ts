import { createStore, type StoreApi } from "zustand/vanilla"
import { persist } from "zustand/middleware"

/**
 * Represents the result of a Zod schema validation.
 * Similar to SafeParseReturnType from zod but avoids a dependency.
 */
type ValidationResult = { success: boolean; data?: unknown; error?: unknown }

/**
 * Creates a Zustand store with built-in localStorage persistence and validation.
 *
 * @param stateBuilder - Function that receives `set` and returns initial state + actions
 * @param validator - Function to validate state during rehydration (e.g., Zod schema.safeParse)
 * @param options - Persist middleware options (name, version, etc.)
 * @returns Configured Zustand store with persistence
 *
 * @example
 * ```ts
 * import { createPersistedStore } from '@repo/services-zustand'
 *
 * const store = createPersistedStore(
 *   (set) => ({
 *     appearance: 'light',
 *     setAppearance: (value) => set({ appearance: value }),
 *   }),
 *   (state) => appearanceSchema.safeParse(state),  // Zod schema validator
 *   { name: 'appearance-store', version: 1 }
 * )
 * ```
 */
export function createPersistedStore<T>(
  stateBuilder: (set: (partial: Partial<T>) => void) => T,
  validator: (state: unknown) => ValidationResult,
  options: { name: string; version: number }
): StoreApi<T> {
  return createStore(
    persist(stateBuilder, {
      ...options,
      name: options.name,
      version: options.version,
      migrate: (state: unknown, version: number) => {
        const result = validator(state)
        if (!result.success) {
          console.warn(
            `Failed to restore persisted state at version ${version}:`,
            result.error
          )
          return undefined
        }
        return result.data
      },
    })
  ) as StoreApi<T>
}
