import type { StateCreator, StoreApi, UseBoundStore } from "zustand"

export type Store<T> = UseBoundStore<StoreApi<T>>

export type StoreCreator<T> = StateCreator<T, [], []>
