import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
    {
        name: "John Doe",
        role: "Developer",
        content:
            "NextPress has revolutionized my workflow. It's so easy to use and customize!",
    },
    {
        name: "Jane Smith",
        role: "Designer",
        content:
            "I love how fast and responsive NextPress is. It's a joy to work with.",
    },
    {
        name: "Mike Johnson",
        role: "Marketer",
        content:
            "The SEO capabilities of NextPress are unmatched. It's helped our content rank higher.",
    },
];

export default function Testimonials() {
    return (
        <section className="py-20">
            <div className="container">
                <h2 className="text-3xl font-bold text-center mb-12">
                    What Our Users Say
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index}>
                            <CardContent className="pt-6">
                                <p className="mb-4">{testimonial.content}</p>
                            </CardContent>
                            <CardFooter className="flex items-center">
                                <Avatar className="mr-2">
                                    <AvatarImage
                                        src={`https://i.pravatar.cc/150?img=${index + 10}`}
                                    />
                                    <AvatarFallback>
                                        {testimonial.name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">
                                        {testimonial.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {testimonial.role}
                                    </p>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
