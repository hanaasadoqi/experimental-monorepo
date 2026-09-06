/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Scope bootstrap: inline script to apply scoped theme before React renders.
 *
 * This runs BEFORE React hydrates, preventing FOUC (flash of unstyled scope).
 * It reads persisted scope overrides from localStorage and applies CSS variables
 * and data attributes to the DOM immediately.
 *
 * Pattern (from beste-ui):
 * - Synchronous execution (no async, no imports)
 * - Runs in <head> or early <body> as `<script strategy="beforeInteractive">`
 * - Accesses only DOM and localStorage
 * - React never re-runs this logic (once applied, scope is stable)
 */

export const SCOPE_STORAGE_PREFIX = "synapcity:scope:"

export interface ScopeBootstrapState {
  scopeId: string
  isDarkModeEnabled?: boolean
  primaryColor?: string
}

/**
 * Generate inline script that applies scope overrides before React loads.
 *
 * Usage in Next.js layout.tsx:
 * ```tsx
 * <Script
 *   id="scope-bootstrap"
 *   strategy="beforeInteractive"
 *   dangerouslySetInnerHTML={{
 *     __html: generateScopeBootstrapCode(),
 *   }}
 * />
 * ```
 *
 * What it does:
 * 1. Reads all localStorage entries matching SCOPE_STORAGE_PREFIX
 * 2. For each scope, applies data-scope-dark-mode and CSS variables
 * 3. Stores scope state in window.__INITIAL_SCOPES__ for React provider
 * 4. No external dependencies, no async
 */
export function generateScopeBootstrapCode(): string {
  const code = `
(function() {
  const PREFIX = "${SCOPE_STORAGE_PREFIX}";
  const scopes = {};

  try {
    // Read all persisted scopes from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            const scopeId = key.substring(PREFIX.length);
            scopes[scopeId] = parsed.state || {};
          } catch (e) {
            // Skip malformed entries
          }
        }
      }
    }

    // Apply scope overrides to DOM
    Object.entries(scopes).forEach(([scopeId, scope]) => {
      const scopeEl = document.querySelector('[data-scope-id="' + scopeId + '"]');
      if (scopeEl) {
        // Set dark mode attribute
        if (scope.isDarkModeEnabled !== undefined) {
          scopeEl.setAttribute(
            'data-scope-dark-mode',
            scope.isDarkModeEnabled ? 'true' : 'false'
          );
        }

        // Apply primary color CSS variable if present
        if (scope.overrides && scope.overrides.primaryColor) {
          scopeEl.style.setProperty(
            '--scope-primary-color',
            scope.overrides.primaryColor
          );
        }
      }
    });

    // Store for provider to read (prevents hydration mismatch)
    window.__INITIAL_SCOPES__ = scopes;
  } catch (error) {
    // Fail silently; React provider will use defaults
  }
})();
`;
  return code;
}

/**
 * Extract initial scope state from window (set by bootstrap script).
 *
 * Called in scope provider during hydration.
 */
export function getInitialScopeState(scopeId: string): ScopeBootstrapState | undefined {
  if (typeof window === "undefined") return undefined;
  const scopes = (window as any).__INITIAL_SCOPES__;
  return scopes?.[scopeId];
}

/**
 * Clear bootstrap data after provider has hydrated.
 *
 * Call this in useEffect after scope provider completes hydration.
 */
export function clearScopeBootstrapData(): void {
  if (typeof window === "undefined") return;
  delete (window as any).__INITIAL_SCOPES__;
}
