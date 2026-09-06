type ThumbIndicatorProps = {
  /** Track position as a 0..1 fraction. */
  position: number
  /** Fill color as a CSS color string. */
  color: string
}

export const ThumbIndicator = ({ position, color }: ThumbIndicatorProps) => {
  // Clamped so an out-of-range value parks the thumb at an edge rather than
  // rendering it outside the track.
  const clamped = Math.min(1, Math.max(0, position))

  return (
    <div
      className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
      style={{
        left: `calc(${clamped * 100}% - 8px)`,
        backgroundColor: color,
        boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
      }}
    />
  )
}
