import type { Store, Selector } from "../types/index.ts"
import { type EqualityFn } from "@repo/shared-utils/shallow-equal"
import { createSelector } from "./create-selector.ts"

/**
 * Create a computed selector from a store.
 * The selector is computed once and cached.
 */
export const createComputed = <T, U>(
  store: Store<T>,
  selector: Selector<T, U>,
  equalityFn?: EqualityFn<U>
) => {
  const memoized = createSelector(selector, equalityFn)

  return {
    get(): U {
      return memoized(store.getState())
    },
    subscribe(callback: (value: U) => void): () => void {
      let lastValue = this.get()

      return store.subscribe((state: T) => {
        const nextValue = memoized(state)
        if (nextValue !== lastValue) {
          lastValue = nextValue
          callback(nextValue)
        }
      })
    },
  }
}
