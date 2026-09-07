import React, { type ReactNode } from "react"
// import { Geist, Geist_Mono, Inter } from "next/font/google"
import { cn } from "@repo/ui-components/lib/utils"
import Script from "next/script"

import { ApplicationProviders } from "../providers/application-providers"

import { generateAppearanceBootstrapCode } from "@repo/adapters-theme-browser/bootstrap"
import { readPreferencesCookie } from "@repo/adapters-next"

import { DEFAULT_APPEARANCE_PREFERENCE } from "@repo/domain-preferences"

import "./globals.css"
import { Viewport } from "next"
import AppShell from "./app-shell"
import { Geist_Mono, IBM_Plex_Sans, Raleway } from "next/font/google"

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-family-sans",
// })

export interface RootLayoutProps {
  children: ReactNode
}

// const geist = Geist({
//   subsets: ["latin"],
//   variable: "--font-family-heading",
// })

// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-family-sans",
// })

// const fontMono = Geist_Mono({
//   subsets: ["latin"],
//   variable: "--font-family-mono",
// })

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const preferences = await readPreferencesCookie()
  const storedPreference = preferences?.appearance
  const storedLanguage = preferences?.language ?? "en"

  const initialAppearance = storedPreference ?? DEFAULT_APPEARANCE_PREFERENCE

  const explicitAppearance =
    initialAppearance === "system" ? undefined : initialAppearance

  // When preference is "system", we suppress hydration warnings because
  // the theme class will be added by bootstrap script (beforeInteractive),
  // which may differ from server render due to browser's system preference.
  const needsHydrationSuppression = initialAppearance === "system"

  return (
    <html
      lang={storedLanguage}
      className={cn(
        "antialiased",
        // fontMono.variable,
        "font-sans",
        // inter.variable,
        // geist.variable,
        raleway.variable,
        ibmPlexSans.variable,
        geistMono.variable,
        {
          dark: explicitAppearance === "dark",
          light: explicitAppearance === "light",
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
      suppressHydrationWarning={needsHydrationSuppression}
    >
      <body className="max-w-screen min-h-screen size-full bg-background text-foreground antialiased">
        <Script
          id="appearance-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: generateAppearanceBootstrapCode(initialAppearance),
          }}
        />
        <ApplicationProviders
          initialPreferences={{
            appearance: initialAppearance,
            language: storedLanguage,
          }}
        >
          <AppShell>{children}</AppShell>
        </ApplicationProviders>
      </body>
    </html>
  )
}
