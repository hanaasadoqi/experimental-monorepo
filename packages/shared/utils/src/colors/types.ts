/**
 * OKLch Color Space Representation
 *
 * Represents a color in cylindrical OKLch (lightness, chroma, hue) format.
 * Perceptually uniform for both lightness and colorfulness.
 *
 * @see {@link https://oklab.github.io|OKLab specification}
 */
export interface OklchColor {
  /** Lightness (0-1): 0 is black, 1 is white */
  readonly lightness: number
  /** Chroma (0+): 0 is achromatic, higher = more saturated */
  readonly chroma: number
  /** Hue (0-2π): angle in radians around the hue circle */
  readonly hue: number
}

/**
 * OKLch Components (same as OklchColor, renamed for clarity)
 */
export interface OklchComponents {
  readonly lightness: number
  readonly chroma: number
  readonly hue: number
}

/**
 * LMS Cone Response (intermediate color space)
 *
 * Represents stimulation of long, medium, and short wavelength cones.
 * Used as intermediate step in OKLch → sRGB conversion.
 */
export interface LmsComponents {
  /** Long wavelength (red) cone response */
  readonly l: number
  /** Medium wavelength (green) cone response */
  readonly m: number
  /** Short wavelength (blue) cone response */
  readonly s: number
}
