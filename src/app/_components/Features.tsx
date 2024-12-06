import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
];

export default function Features() {
  return (
    <section className="py-20 bg-muted">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
  );
}
