import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import Header from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Providers } from '@/components/Providers'
import { Toaster } from "@/components/ui/toaster"
import {Analytics} from "@vercel/analytics/react";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'NextPress',
  description: 'A WordPress clone built with Next.js',
}

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
      <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
      <Providers>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </Providers>
      <Analytics/>
      </body>
      </html>
  )
}

