"use client"

interface FontSelectProps {
  type: "body" | "heading" | "mono"
  font: string
  onFontChange: (font: string) => void
}

const AVAILABLE_FONTS = ["Inter", "Roboto", "IBM Plex Sans", "Fira Sans", "Source Serif Pro"]

export function FontSelect({ type, font, onFontChange }: FontSelectProps) {
  return (
    <div>
      <label htmlFor={`font-${type}`} className="text-sm font-medium">
        {type.charAt(0).toUpperCase() + type.slice(1)} Font
      </label>
      <select
        id={`font-${type}`}
        value={font}
        onChange={(e) => onFontChange(e.target.value)}
        className="w-full px-2 py-1 border rounded"
      >
        <option value="">Select a font</option>
        {AVAILABLE_FONTS.map((fontName) => (
          <option key={fontName} value={fontName}>
            {fontName}
          </option>
        ))}
      </select>
    </div>
  )
}
