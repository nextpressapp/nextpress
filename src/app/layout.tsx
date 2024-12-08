import "@/styles/globals.css";

import { ReactNode } from "react";
import { Metadata } from "next";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import { prisma } from "@/lib/prisma";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

async function getSiteSettings() {
  return await prisma.siteSettings.findFirst();
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  console.log(settings);
  return {
    title: {
      default: settings?.siteName || "NextPress",
      template: `%s | ${settings?.siteName || "NextPress"}`,
    },
    description: settings?.description || "A Next.js powered CMS",
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className,
        )}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
