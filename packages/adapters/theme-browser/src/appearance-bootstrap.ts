import type { AppearancePreference } from "@repo/domain-preferences"

/**
 * Generate the minimal browser program that resolves appearance pre-hydration.
 * Includes individual error handling for each DOM operation to gracefully degrade
 * under strict CSP policies or other DOM restrictions.
 */
export function generateAppearanceBootstrapCode(
  preference: AppearancePreference
): string {
  return `(function(){try{var p=${JSON.stringify(preference)};var a=p==="system"&&window.matchMedia?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":p;var r=document.documentElement;if(r){try{r.classList.toggle("dark",a==="dark")}catch(e){console.warn("Failed to toggle dark class:",e)}try{r.classList.toggle("light",a==="light")}catch(e){console.warn("Failed to toggle light class:",e)}try{r.setAttribute("data-theme",a)}catch(e){console.warn("Failed to set data-theme attribute:",e)}try{r.style.colorScheme=a}catch(e){console.warn("Failed to set colorScheme style:",e)}}}catch(e){console.error("Bootstrap appearance setup failed:",e)}})()`
}
