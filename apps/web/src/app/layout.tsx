import React, { type ReactNode } from "react"
import { Geist, Geist_Mono, Inter } from "next/font/google"
import { cn } from "@repo/ui-components/lib/utils"
import Script from "next/script"

import { ApplicationProviders } from "../providers/application-providers"

import { generateAppearanceBootstrapCode } from "@repo/adapters-theme-browser/bootstrap"
import { readAppearancePreferenceCookie } from "../server/preferences/read-appearance-preference-cookie"

import { DEFAULT_APPEARANCE_PREFERENCE } from "@repo/features-preferences"

import "./globals.css"
import { Viewport } from "next"
import AppShell from "./app-shell"

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

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

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
      suppressHydrationWarning
    >
      <body>
        <Script
          id="appearance-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: generateAppearanceBootstrapCode(initialAppearance),
          }}
        />
        <ApplicationProviders initialAppearance={initialAppearance}>
          <AppShell>{children}</AppShell>
        </ApplicationProviders>
      </body>
    </html>
  )
}
