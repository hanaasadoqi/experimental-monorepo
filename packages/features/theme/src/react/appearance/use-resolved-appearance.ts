"use client"

import type { ResolvedAppearance } from "../../model"

import { useAppearanceContext } from "./appearance-context"

export function useResolvedAppearance(): ResolvedAppearance {
  return useAppearanceContext()
}
