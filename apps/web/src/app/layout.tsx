import { Geist, Geist_Mono, Inter } from "next/font/google"

import "@repo/ui-components/globals.css"
import { ThemeWrapper } from "@repo/feature-theme/components"
import { cn } from "@repo/ui-components/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
      <body>
        <ThemeWrapper>{children}</ThemeWrapper>
      </body>
    </html>
  )
}
