/**
 * Compatibility tombstone for the former pre-hydration scoped-theme script.
 *
 * The implementation queried scoped elements before the application body was
 * available and its bootstrap state was never consumed by the provider. The
 * live runtime now uses an injected storage boundary and makes no pre-paint
 * guarantee. A future bootstrap belongs in the browser adapter.
 */
export {}
