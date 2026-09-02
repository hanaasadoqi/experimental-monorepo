/**
 * Curated list of Google Fonts organized by category.
 * Used for the typography autocomplete. Fonts are loaded dynamically
 * via Google Fonts CSS API when selected.
 */

export type GoogleFont = {
  name: string
  category: "Sans Serif" | "Serif" | "Display" | "Handwriting" | "Monospace"
}

export const GOOGLE_FONTS: GoogleFont[] = [
  // Sans Serif (most popular)
  { name: "Inter", category: "Sans Serif" },
  { name: "Roboto", category: "Sans Serif" },
  { name: "Open Sans", category: "Sans Serif" },
  { name: "Lato", category: "Sans Serif" },
  { name: "Montserrat", category: "Sans Serif" },
  { name: "Poppins", category: "Sans Serif" },
  { name: "Nunito", category: "Sans Serif" },
  { name: "Nunito Sans", category: "Sans Serif" },
  { name: "Raleway", category: "Sans Serif" },
  { name: "Ubuntu", category: "Sans Serif" },
  { name: "Work Sans", category: "Sans Serif" },
  { name: "Rubik", category: "Sans Serif" },
  { name: "DM Sans", category: "Sans Serif" },
  { name: "Plus Jakarta Sans", category: "Sans Serif" },
  { name: "Manrope", category: "Sans Serif" },
  { name: "Outfit", category: "Sans Serif" },
  { name: "Space Grotesk", category: "Sans Serif" },
  { name: "Geist", category: "Sans Serif" },
  { name: "Figtree", category: "Sans Serif" },
  { name: "Onest", category: "Sans Serif" },
  { name: "Bricolage Grotesque", category: "Sans Serif" },
  { name: "Sora", category: "Sans Serif" },
  { name: "Urbanist", category: "Sans Serif" },
  { name: "Source Sans 3", category: "Sans Serif" },
  { name: "PT Sans", category: "Sans Serif" },
  { name: "Noto Sans", category: "Sans Serif" },
  { name: "Mulish", category: "Sans Serif" },
  { name: "Barlow", category: "Sans Serif" },
  { name: "Karla", category: "Sans Serif" },
  { name: "Quicksand", category: "Sans Serif" },
  { name: "Kanit", category: "Sans Serif" },
  { name: "Hind", category: "Sans Serif" },
  { name: "Heebo", category: "Sans Serif" },
  { name: "Fira Sans", category: "Sans Serif" },
  { name: "Oxygen", category: "Sans Serif" },
  { name: "IBM Plex Sans", category: "Sans Serif" },
  { name: "Red Hat Display", category: "Sans Serif" },
  { name: "Albert Sans", category: "Sans Serif" },
  { name: "Public Sans", category: "Sans Serif" },
  { name: "Lexend", category: "Sans Serif" },
  { name: "Archivo", category: "Sans Serif" },

  // Serif
  { name: "Playfair Display", category: "Serif" },
  { name: "Merriweather", category: "Serif" },
  { name: "Lora", category: "Serif" },
  { name: "PT Serif", category: "Serif" },
  { name: "Noto Serif", category: "Serif" },
  { name: "EB Garamond", category: "Serif" },
  { name: "Cormorant Garamond", category: "Serif" },
  { name: "Crimson Text", category: "Serif" },
  { name: "Libre Baskerville", category: "Serif" },
  { name: "Bitter", category: "Serif" },
  { name: "Source Serif 4", category: "Serif" },
  { name: "Fraunces", category: "Serif" },
  { name: "Instrument Serif", category: "Serif" },
  { name: "DM Serif Display", category: "Serif" },
  { name: "DM Serif Text", category: "Serif" },
  { name: "Newsreader", category: "Serif" },
  { name: "Bricolage Grotesque", category: "Serif" },
  { name: "Spectral", category: "Serif" },
  { name: "Cardo", category: "Serif" },
  { name: "Domine", category: "Serif" },
  { name: "Vollkorn", category: "Serif" },
  { name: "Alegreya", category: "Serif" },
  { name: "Old Standard TT", category: "Serif" },
  { name: "Libre Caslon Text", category: "Serif" },

  // Display
  { name: "Oswald", category: "Display" },
  { name: "Bebas Neue", category: "Display" },
  { name: "Anton", category: "Display" },
  { name: "Archivo Black", category: "Display" },
  { name: "Abril Fatface", category: "Display" },
  { name: "Josefin Sans", category: "Display" },
  { name: "Comfortaa", category: "Display" },
  { name: "Righteous", category: "Display" },
  { name: "Teko", category: "Display" },
  { name: "Saira Condensed", category: "Display" },
  { name: "Fjalla One", category: "Display" },
  { name: "Alfa Slab One", category: "Display" },
  { name: "Russo One", category: "Display" },
  { name: "Unbounded", category: "Display" },
  { name: "Major Mono Display", category: "Display" },
  { name: "Playfair Display SC", category: "Display" },
  { name: "Paytone One", category: "Display" },

  // Handwriting
  { name: "Pacifico", category: "Handwriting" },
  { name: "Dancing Script", category: "Handwriting" },
  { name: "Caveat", category: "Handwriting" },
  { name: "Great Vibes", category: "Handwriting" },
  { name: "Sacramento", category: "Handwriting" },
  { name: "Satisfy", category: "Handwriting" },
  { name: "Kalam", category: "Handwriting" },
  { name: "Indie Flower", category: "Handwriting" },
  { name: "Shadows Into Light", category: "Handwriting" },
  { name: "Permanent Marker", category: "Handwriting" },
  { name: "Amatic SC", category: "Handwriting" },
  { name: "Homemade Apple", category: "Handwriting" },
  { name: "Patrick Hand", category: "Handwriting" },

  // Monospace
  { name: "JetBrains Mono", category: "Monospace" },
  { name: "Fira Code", category: "Monospace" },
  { name: "Source Code Pro", category: "Monospace" },
  { name: "IBM Plex Mono", category: "Monospace" },
  { name: "Roboto Mono", category: "Monospace" },
  { name: "Space Mono", category: "Monospace" },
  { name: "Inconsolata", category: "Monospace" },
  { name: "Ubuntu Mono", category: "Monospace" },
  { name: "Courier Prime", category: "Monospace" },
  { name: "DM Mono", category: "Monospace" },
  { name: "Geist Mono", category: "Monospace" },
]

/**
 * Loaded fonts cache to prevent duplicate <link> injections
 */
const LOADED_FONTS = new Set<string>()

/**
 * Dynamically loads a Google Font by injecting a <link> stylesheet tag.
 * Safe to call multiple times — no duplicate loads.
 */
export function loadGoogleFont(fontName: string): void {
  if (typeof document === "undefined") return
  if (LOADED_FONTS.has(fontName)) return

  const normalized = fontName.replace(/ /g, "+")
  const href = `https://fonts.googleapis.com/css2?family=${normalized}:wght@400;500;600;700&display=swap`

  // Check if already in DOM
  const existing = document.head.querySelector(`link[href="${href}"]`)
  if (existing) {
    LOADED_FONTS.add(fontName)
    return
  }

  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = href
  document.head.appendChild(link)
  LOADED_FONTS.add(fontName)
}

/**
 * Returns the CSS font-family value for a Google Font with proper fallbacks
 */
export function fontFamilyValue(
  fontName: string,
  category: GoogleFont["category"]
): string {
  const fallbacks: Record<GoogleFont["category"], string> = {
    "Sans Serif": "system-ui, -apple-system, sans-serif",
    Serif: "Georgia, Cambria, 'Times New Roman', serif",
    Display: "system-ui, sans-serif",
    Handwriting: "cursive",
    Monospace: "ui-monospace, 'SF Mono', Menlo, monospace",
  }
  return `"${fontName}", ${fallbacks[category]}`
}
