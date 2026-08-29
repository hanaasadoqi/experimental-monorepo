import type { StateCreator, StoreApi } from "zustand"

export type Store<T> = StoreApi<T>

export type StoreCreator<T> = StateCreator<T, [], []>
