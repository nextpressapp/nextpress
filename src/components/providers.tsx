"use client"

import { ReactNode } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

import { Toaster } from "@/components/ui/sonner"
import { CookieConsentBanner } from "@/components/cookie-consent"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      attribute="class"
    >
      {children}
      <Toaster expand richColors position="bottom-center" />
      <CookieConsentBanner />
    </NextThemesProvider>
  )
}
