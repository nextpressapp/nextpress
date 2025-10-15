import "@/style/globals.css"

import { ReactNode } from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { db } from "@/db"
import { cn } from "@/lib/utils"
import { Providers } from "@/components/providers"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
})

async function getSiteSettings() {
  return await db.query.siteSettings.findFirst()
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    title: {
      default: settings?.siteName || "NextPress",
      template: `%s | ${settings?.siteName || "NextPress"}`,
    },
    description: settings?.description || "A Next.js powered CMS",
  }
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
