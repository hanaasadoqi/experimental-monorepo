"use client"

import { AppearancePreference, ResolvedColorScheme } from "../types"

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
  if (!["light", "dark", "system"].includes(preference)) {
    preference = "system"
  }

  const code = `(function(){var p=${JSON.stringify(preference)};var s=p==='system'?(typeof window!=='undefined'&&window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):p;var r=document.documentElement;if(!r)return;if(s==='dark'){r.classList.add('dark')}else{r.classList.remove('dark')}r.setAttribute('data-theme',s);r.style.colorScheme=s})()`

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
): ResolvedColorScheme {
  if (preference === "system") {
    return "light"
  }
  return preference as ResolvedColorScheme
}
