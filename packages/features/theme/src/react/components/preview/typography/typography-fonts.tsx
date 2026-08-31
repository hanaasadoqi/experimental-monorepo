"use client"

export function TypographyFonts() {
  const fonts = [
    {
      name: "Inter",
      family: "var(--font-inter)",
      description: "Inter - Versatile Sans-Serif",
      type: "sans-serif" as const,
    },
    {
      name: "Space Grotesk",
      family: "var(--font-space-grotesk)",
      description: "Space Grotesk - Modern Sans-Serif",
      type: "sans-serif" as const,
    },
    {
      name: "Space Mono",
      family: "var(--font-space-mono)",
      description: "Space Mono - Monospaced",
      type: "monospace" as const,
    },
    {
      name: "System Sans-Serif",
      family: "var(--font-sans-system)",
      description: "System UI - Generic Sans-Serif",
      type: "sans-serif" as const,
    },
    {
      name: "System Serif",
      family: "var(--font-serif-system)",
      description: "System UI - Generic Serif",
      type: "serif" as const,
    },
    {
      name: "JetBrains Mono",
      family: "var(--font-jetbrains-mono)",
      description: "JetBrains Mono - Monospaced",
      type: "monospace" as const,
    },
  ]

  const alpha = `ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789`

  const renderSample = (type: "sans-serif" | "serif" | "monospace") => {
    switch (type) {
      case "serif":
        return <h4 className="text-sm">{alpha}</h4>
      case "monospace":
        return <span className="text-sm">{alpha}</span>
      default:
        return <p className="text-sm">{alpha}</p>
    }
  }

  return (
    <div className="space-y-6">
      {fonts.map(({ name, family, description, type }) => (
        <div key={name} className="space-y-2 border-b border-(--border) pb-4">
          <div className="flex items-baseline gap-3">
            <span className="text-sm font-semibold text-(--muted-foreground) w-24">
              {name}
            </span>
            <span className="text-xs text-(--muted-foreground)">
              {description}
            </span>
          </div>
          <div style={{ fontFamily: family }} className="text-xl">
            The quick brown fox jumps over the lazy dog
          </div>
          <div style={{ fontFamily: family }}>{renderSample(type)}</div>
        </div>
      ))}
    </div>
  )
}
