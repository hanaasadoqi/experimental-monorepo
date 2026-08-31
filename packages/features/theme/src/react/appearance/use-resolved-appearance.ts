"use client"

import type { ResolvedAppearance } from "../../model/colors"

import { useAppearanceContext } from "./appearance-context"

export function useResolvedAppearance(): ResolvedAppearance {
  return useAppearanceContext()
}
