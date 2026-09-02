"use client"

import { useAppearanceContext } from "./appearance-context"
import { ResolvedAppearance } from "./model";

export function useResolvedAppearance(): ResolvedAppearance {
  return useAppearanceContext()
}
