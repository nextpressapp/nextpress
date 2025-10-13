import { Faq } from "@/components/home/faq"
import { Features } from "@/components/home/features"
import { Hero } from "@/components/home/hero"
import { Testimonials } from "@/components/home/testimonials"

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <Testimonials />
      <Faq />
    </main>
  )
}
