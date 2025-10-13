import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    title: "Easy to Use",
    description: "Intuitive interface for content creation and management",
  },
  {
    title: "Fast Performance",
    description: "Built on Next.js for lightning-fast page loads",
  },
  {
    title: "SEO Friendly",
    description: "Optimized for search engines out of the box",
  },
  {
    title: "Customizable",
    description: "Easily extend and customize to fit your needs",
  },
]

export const Features = () => {
  return (
    <section className="bg-muted py-20">
      <div className="container">
        <h2 className="mb-12 text-center text-3xl font-bold">Features</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
