
/**
 * Validation utilities re-exported from parse.ts for backward compatibility.
 * New code should import directly from parse.ts.
 *
 * @deprecated Import from "./parse" instead
 */

import { validateOklch } from "./parse"
import type { OklchInput } from "./model"

export { isValidHex } from "./parse"

/**
 * Boolean validator that wraps validateOklch (for convenience).
 * Returns true if the value is a valid OKLCH color in any supported format.
 */
export const isValidOklch = (value: OklchInput | unknown): boolean =>
  validateOklch(value).success
