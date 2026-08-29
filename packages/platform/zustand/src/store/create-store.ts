import { create } from "zustand"

import type { Store } from "../types"

export const createStore = <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  creator: any
): Store<T> => {
  return create<T>(creator)
}
