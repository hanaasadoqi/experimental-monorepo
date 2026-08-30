import { Geist, Geist_Mono, Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@repo/ui-components/lib/utils"
import type { ReactNode } from "react"
import Script from "next/script"

import { DEFAULT_APPEARANCE_PREFERENCE } from "@repo/feature-preferences"

import { generateBootstrapCode } from "@repo/feature-theme"

import { ApplicationProviders } from "../providers/application-providers"

import { readAppearancePreferenceCookie } from "../server/preferences/read-appearance-preference-cookie"

export interface RootLayoutProps {
  children: ReactNode
}

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-family-heading",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-family-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-family-mono",
})

export default async function RootLayout({ children }: RootLayoutProps) {
  const storedPreference = await readAppearancePreferenceCookie()

  const initialAppearance = storedPreference ?? DEFAULT_APPEARANCE_PREFERENCE

  const explicitAppearance =
    initialAppearance === "system" ? undefined : initialAppearance

  return (
    <html
      lang="en"
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
        geist.variable,
        {
          dark: explicitAppearance === "dark",
        }
      )}
      data-theme={explicitAppearance}
      style={
        explicitAppearance
          ? {
              colorScheme: explicitAppearance,
            }
          : undefined
      }
      suppressHydrationWarning
    >
      <body>
        <Script id="appearance-bootstrap" strategy="beforeInteractive">
          {generateBootstrapCode(initialAppearance)}
        </Script>

        <ApplicationProviders initialAppearance={initialAppearance}>
          {children}
        </ApplicationProviders>
      </body>
    </html>
  )
}
