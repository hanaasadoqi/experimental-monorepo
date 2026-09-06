import type { AppearancePreference } from "@repo/domain-theme/appearance"

/** Generate the minimal browser program that resolves appearance pre-hydration. */
export function generateAppearanceBootstrapCode(
  preference: AppearancePreference
): string {
  return `(function(){var p=${JSON.stringify(preference)};var a=p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":p==="system"?"light":p;var r=document.documentElement;r.classList.toggle("dark",a==="dark");r.classList.toggle("light",a==="light");r.dataset.theme=a;r.style.colorScheme=a})()`
}
