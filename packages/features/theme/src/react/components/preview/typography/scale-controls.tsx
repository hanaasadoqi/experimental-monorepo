"use client"

interface ScaleControlsProps {
  fontStep: number
  onFontStepChange: (step: number) => void
  maxStep?: number
  minStep?: number
}

export function ScaleControls({
  fontStep,
  onFontStepChange,
  maxStep = 4,
  minStep = -4,
}: ScaleControlsProps) {
  const getScalePercentage = () => {
    const scale = 1 + fontStep * 0.15
    return Math.round((scale - 1) * 100)
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => onFontStepChange(Math.max(fontStep - 1, minStep))}
        disabled={fontStep <= minStep}
        className="px-3 py-1.5 text-sm font-medium rounded-md bg-(--primary) text-(--primary-foreground) disabled:opacity-50 disabled:cursor-not-allowed hover:bg-(--primary)/90"
      >
        −
      </button>
      <div className="flex-1 text-center">
        <div className="text-lg font-semibold">
          {getScalePercentage() > 0 ? "+" : ""}
          {getScalePercentage()}%
        </div>
        <div className="text-xs text-(--muted-foreground)">
          Step: {fontStep}/{maxStep} (
          {fontStep === 0 ? "Default" : fontStep > 0 ? "Larger" : "Smaller"})
        </div>
      </div>
      <button
        onClick={() => onFontStepChange(Math.min(fontStep + 1, maxStep))}
        disabled={fontStep >= maxStep}
        className="px-3 py-1.5 text-sm font-medium rounded-md bg-(--primary) text-(--primary-foreground) disabled:opacity-50 disabled:cursor-not-allowed hover:bg-(--primary)/90"
      >
        +
      </button>
      {fontStep !== 0 && (
        <button
          onClick={() => onFontStepChange(0)}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-(--secondary) text-(--secondary-foreground) hover:bg-(--secondary)/90"
        >
          Reset
        </button>
      )}
    </div>
  )
}
