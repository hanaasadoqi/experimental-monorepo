export function isTypingTarget(
  target: EventTarget | null,
  tagNames: string[] = []
) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const defaultTagNames = ["INPUT", "TEXTAREA", "SELECT"]
  const normalizedTagNames = [...tagNames]?.map((tag) => tag.toUpperCase())
  const finalTagNames = Array.from(
    new Set([...defaultTagNames, ...normalizedTagNames])
  )

  const finalValue = finalTagNames.includes(target.tagName) || target.isContentEditable
  return finalValue
}
