import "@/styles/globals.css";
import { ReactNode } from "react";

import ScrollToTopButton from "@/components/scroll-to-top";

import { Header } from "@/app/(site)/_components/Header";
import { Footer } from "@/app/(site)/_components/Footer";

export default function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <ScrollToTopButton />
      <Footer />
    </>
  );
}
