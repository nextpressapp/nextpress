import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is NextPress?",
    answer:
      "NextPress is a WordPress clone built with Next.js, offering modern web development features and performance.",
  },
  {
    question: "Is NextPress free to use?",
    answer:
      "Yes, NextPress is open-source and free to use for personal and commercial projects.",
  },
  {
    question: "Can I migrate my WordPress site to NextPress?",
    answer:
      "While there's no direct migration path, we're working on tools to make the transition easier.",
  },
  {
    question: "How do I get started with NextPress?",
    answer:
      "You can clone the NextPress repository and follow our documentation to set up your first site.",
  },
];

export default function FAQ() {
  return (
    <section className="py-20 bg-muted">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        <Accordion
          type="single"
          collapsible
          className="w-full max-w-2xl mx-auto"
        >
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
