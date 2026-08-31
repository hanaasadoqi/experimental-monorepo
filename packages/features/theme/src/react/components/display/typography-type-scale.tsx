export function TypographyShowcase() {
  const sizes = [
    { class: "text-xs", size: "xs", actual: "12px" },
    { class: "text-sm", size: "sm", actual: "14px" },
    { class: "text-base", size: "base", actual: "16px" },
    { class: "text-lg", size: "lg", actual: "18px" },
    { class: "text-xl", size: "xl", actual: "20px" },
    { class: "text-2xl", size: "2xl", actual: "24px" },
    { class: "text-3xl", size: "3xl", actual: "30px" },
    { class: "text-4xl", size: "4xl", actual: "36px" },
  ]

  const weights = [
    { class: "font-light", weight: "300" },
    { class: "font-normal", weight: "400" },
    { class: "font-medium", weight: "500" },
    { class: "font-semibold", weight: "600" },
    { class: "font-bold", weight: "700" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Type Scale</h3>
        <div className="space-y-3">
          {sizes.map(({ class: className, size, actual }) => (
            <div key={size} className="flex items-baseline gap-4">
              <div className="w-24 text-xs font-mono text-muted-foreground">
                {size} ({actual})
              </div>
              <p className={className}>
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Font Weights</h3>
        <div className="space-y-2">
          {weights.map(({ class: className, weight }) => (
            <div key={weight} className="flex items-center gap-4">
              <span className="w-24 text-xs font-mono text-muted-foreground">
                {weight}
              </span>
              <p className={`text-base ${className}`}>
                The quick brown fox jumps
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Headings</h3>
        <div className="space-y-4">
          <h1>Heading 1 (h1)</h1>
          <h2>Heading 2 (h2)</h2>
          <h3>Heading 3 (h3)</h3>
          <h4>Heading 4 (h4)</h4>
          <h5>Heading 5 (h5)</h5>
          <h6>Heading 6 (h6)</h6>
        </div>
      </div>
    </div>
  )
}
