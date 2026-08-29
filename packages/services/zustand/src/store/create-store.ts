import { create } from "zustand"

import type { Store, StateCreator } from "../types/index.js"

export const createStore = <T>(creator: StateCreator<T, []>): Store<T> => {
  return create(creator)
}
