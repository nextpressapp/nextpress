import "@/style/globals.css"

import { ReactNode } from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { cn } from "@/lib/utils"
import { Providers } from "@/components/providers"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
})

export const metadata: Metadata = {
  title: {
    default: "NextPress",
    template: "%s | NextPress",
  },
  description: "A Next.js powered CMS",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("bg-background min-h-screen font-sans antialiased", inter.className)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
