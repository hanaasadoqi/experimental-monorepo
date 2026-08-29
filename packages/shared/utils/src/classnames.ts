import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes intelligently.
 * Uses clsx for conditional classes and tailwind-merge for conflict resolution.
 * @param inputs - Class names or conditional class objects
 * @returns Merged class string with Tailwind conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type { ClassValue }
