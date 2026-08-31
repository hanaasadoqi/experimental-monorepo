"use client"

export function TypographyWeights() {
  const weights = [
    { name: "Light", weight: "300", var: "var(--font-weight-light)" },
    { name: "Regular", weight: "400", var: "var(--font-weight-regular)" },
    { name: "Medium", weight: "500", var: "var(--font-weight-medium)" },
    { name: "Semibold", weight: "600", var: "var(--font-weight-semibold)" },
    { name: "Bold", weight: "700", var: "var(--font-weight-bold)" },
    { name: "Extrabold", weight: "800", var: "var(--font-weight-extrabold)" },
  ]

  return (
    <div className="space-y-4">
      {weights.map(({ name, weight, var: varName }) => (
        <div
          key={name}
          className="flex items-center gap-4 border-b border-(--border) pb-3"
        >
          <div className="w-32 text-sm text-(--muted-foreground)">
            {name}({weight})
          </div>
          <div style={{ fontWeight: varName }} className="text-2xl">
            The quick brown fox jumps over the lazy dog
          </div>
        </div>
      ))}
    </div>
  )
}
