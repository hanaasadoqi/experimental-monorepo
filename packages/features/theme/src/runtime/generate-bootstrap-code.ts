import { AppearancePreference } from "@repo/feature-preferences"
import { ResolvedAppearance } from "../model/appearance"

/**
 * Generate executable code to reconcile appearance before hydration.
 * @param preference The appearance preference ('light', 'dark', or 'system')
 * @returns JavaScript code suitable for a framework script component
 */
export function generateBootstrapCode(
  preference: AppearancePreference
): string {
  return `(function(){var p=${JSON.stringify(preference)};var a=p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":p==="system"?"light":p;var r=document.documentElement;r.classList.toggle("dark",a==="dark");r.dataset.theme=a;r.style.colorScheme=a})()`
}

/**
 * Generate a minimal inline script to reconcile appearance before hydration.
 * @param preference The appearance preference ('light', 'dark', or 'system')
 * @param nonce Optional CSP nonce
 * @returns A complete <script> element as a string
 */
export function generateBootstrapScript(
  preference: AppearancePreference,
  nonce?: string
): string {
  const code = generateBootstrapCode(preference)

  if (nonce) {
    return `<script nonce="${escapeHtml(nonce)}">${code}</script>`
  }

  return `<script>${code}</script>`
}

/**
 * Escape HTML special characters to prevent XSS.
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }
  return text.replace(/[&<>"']/g, (char) => map[char] || char)
}

/**
 * Server-side function to resolve initial color scheme (no matchMedia available).
 * Always resolves 'system' to 'light' on the server.
 */
export function resolveServerColorScheme(
  preference: AppearancePreference
): ResolvedAppearance {
  if (preference === "system") {
    return "light"
  }
  return preference as ResolvedAppearance
}
