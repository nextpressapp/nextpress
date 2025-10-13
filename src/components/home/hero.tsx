import { Button } from "@/components/ui/button"

export const Hero = () => {
  return (
    <section className="py-20 text-center">
      <h1 className="mb-4 text-4xl font-bold">Welcome to NextPress</h1>
      <p className="mb-8 text-xl">The next generation WordPress clone built with Next.js</p>
      <Button size="lg">Get Started</Button>
    </section>
  )
}
