import "@/styles/globals.css";

import { ReactNode } from "react";
import { Metadata } from "next";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

async function getSiteSettings() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/settings`, {
    cache: "no-store",
  });
  return res.json();
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: {
      default: settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.description,
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
      </body>
    </html>
  );
}
