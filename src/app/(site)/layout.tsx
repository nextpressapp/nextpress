import { ReactNode } from "react"

import { ScrollToTopButton } from "@/components/scroll-to-top"
import { Footer } from "@/components/site/footer"
import { Header } from "@/components/site/header"

export default function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <ScrollToTopButton />
      <Footer />
    </>
  )
}
