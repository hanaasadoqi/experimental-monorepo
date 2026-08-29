import type { StateCreator, StoreApi, UseBoundStore } from "zustand"

type Store<T> = UseBoundStore<StoreApi<T>>

type StoreCreator<T> = StateCreator<T, [], []>

/**
 * Selector function that extracts a value from state.
 */
export type Selector<T, U> = (state: T) => U

/**
 * Slice creator function.
 * Takes a Zustand set/get/store and returns a slice of state.
 */
type SliceCreator<T, U> = (
  set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
  get: () => T,
  api: StoreApi<T>
) => unknown & U

type SliceState<T> = T extends SliceCreator<infer S, unknown> ? S : never

/**
 * Type-safe slice extractor.
 * Extracts typed slice from the full store state.
 */
type SliceExtractor<T, K extends keyof T> = (state: T) => T[K]

export type {
  StateCreator,
  StoreApi,
  UseBoundStore,
  Store,
  StoreCreator,
  SliceCreator,
  SliceState,
  SliceExtractor,
}
