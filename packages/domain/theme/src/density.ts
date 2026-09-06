import { z } from "zod"

/** Spacing and sizing density applied to application surfaces. */
export const densityModeSchema = z.enum(["compact", "default", "reading"])

export type DensityMode = z.infer<typeof densityModeSchema>

export const DENSITY_MODES: readonly DensityMode[] = densityModeSchema.options

export const DEFAULT_DENSITY: DensityMode = "default"
