import { Geist, Geist_Mono, Inter } from "next/font/google"
import Script from "next/script"

import "./globals.css"
import { readAppearancePreferenceCookie } from "@repo/feature-preferences/server"
import { generateBootstrapCode } from "@repo/feature-theme/runtime"
import { cn } from "@repo/ui-components/lib/utils"

import { ApplicationProviders } from "../components"

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const preference = await readAppearancePreferenceCookie()
  const effectivePreference = preference ?? "system"
  const explicitColorScheme =
    effectivePreference === "system" ? undefined : effectivePreference

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme={explicitColorScheme}
      style={{
        ...(explicitColorScheme
          ? { colorScheme: explicitColorScheme }
          : undefined),
      }}
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
        geist.variable,
        {
          light: explicitColorScheme ? explicitColorScheme === "light" : effectivePreference === "light",
          dark: explicitColorScheme ? explicitColorScheme === "dark" : effectivePreference === "dark",
        }
      )}
    >
      <body>
        <Script
          id="appearance-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: generateBootstrapCode(effectivePreference),
          }}
          suppressHydrationWarning
        />
        <ApplicationProviders
          {...(effectivePreference === undefined
            ? {}
            : { initialPreference: effectivePreference })}
        >
          {children}
        </ApplicationProviders>
      </body>
    </html>
  )
}
