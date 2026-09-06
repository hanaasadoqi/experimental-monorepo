export class MissingContextError extends Error {
  constructor(contextName: string) {
    super(
      `${contextName} is unavailable. Ensure the component is rendered within its provider.`
    )
    this.name = "MissingContextError"
  }
}
