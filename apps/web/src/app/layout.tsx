import { Geist, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeWrapper } from "@repo/feature-theme/components"
import { generateBootstrapScript } from "@repo/feature-theme/runtime"
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
  const bootstrapScript = generateBootstrapScript(preference || "system")

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
        geist.variable
      )}
    >
      <head>{/* meta tags, etc */}</head>
      <body>
        <ThemeWrapper
          initialPreference={preference}
          bootstrapScript={bootstrapScript}
        >
          {children}
        </ThemeWrapper>
      </body>
    </html>
  )
}
