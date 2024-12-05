import "@/styles/globals.css";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import {store} from "next/dist/build/output/store";
import {Providers} from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NextPress",
  description: "A WordPress clone built with Next.js",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
      <Providers>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
        </ThemeProvider>
      </Providers>
      </body>
    </html>
  );
}
