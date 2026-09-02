"use client"

import { useAppearanceContext } from "./appearance-context"
import { ResolvedAppearance } from "../theme.schema";

export function useResolvedAppearance(): ResolvedAppearance {
  return useAppearanceContext()
}
