"use client"


import { useAppearanceContext } from "./appearance-context"
import type { ResolvedAppearance } from "./model";

export function useResolvedAppearance(): ResolvedAppearance {
  return useAppearanceContext()
}
