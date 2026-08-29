import { create } from "zustand"
import type { StateCreator } from "zustand"

import type { Store } from "../types/index.ts"

export const createStore = <T>(creator: StateCreator<T, []>): Store<T> => {
  return create(creator)
}
