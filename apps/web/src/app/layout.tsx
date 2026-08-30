import { Geist, Geist_Mono, Inter } from "next/font/google"
import Script from "next/script"

import "./globals.css"
import { ThemeWrapper } from "@repo/feature-theme/components"
import { generateBootstrapCode } from "@repo/feature-theme/runtime"
import { readAppearanceCookie } from "@repo/feature-theme/server"
import { cn } from "@repo/ui-components/lib/utils"

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
  const preference = await readAppearanceCookie()
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
          light: explicitColorScheme === "light",
          dark: explicitColorScheme === "dark",
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
        <ThemeWrapper initialPreference={preference}>{children}</ThemeWrapper>
      </body>
    </html>
  )
}
