import { Button } from '@/components/ui/button'

export default function Hero() {
    return (
        <section className="py-20 text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to NextPress</h1>
            <p className="text-xl mb-8">The next generation WordPress clone built with Next.js</p>
            <Button size="lg">Get Started</Button>
        </section>
    )
}

