import type { Store } from "../types/index.ts"

type Selector<T, U> = (state: T) => U

export const createUseSelector = <T>(
  store: Store<T>
): (<U>(selector: Selector<T, U>) => U) => {
  return <U>(selector: Selector<T, U>): U => selector(store.getState())
}
