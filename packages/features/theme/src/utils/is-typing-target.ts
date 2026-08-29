export function isTypingTarget(
  target: EventTarget | null,
  tagNames: string[] = []
): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const defaultTagNames = ["INPUT", "TEXTAREA", "SELECT"]
  const normalizedTagNames = [...tagNames]?.map((tag) => tag.toUpperCase())
  const finalTagNames = Array.from(
    new Set([...defaultTagNames, ...normalizedTagNames])
  )

  return (
    finalTagNames.includes(target.tagName) || (target.isContentEditable ?? false)
  )
}
