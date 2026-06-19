import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/shared/public-page";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQS } from "@/lib/mock-data";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [
    { title: "FAQ — KAFD Hackathon" },
    { name: "description", content: "Answers to common questions about the KAFD Hackathon program." },
    { property: "og:title", content: "FAQ — KAFD Hackathon" },
    { property: "og:description", content: "Eligibility, IP, judging and logistics." },
  ]}),
  component: FaqPage,
});

function FaqPage() {
  return (
    <PublicPage eyebrow="Help" title="Frequently asked questions">
      <div className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`q-${i}`} className="border-border">
              <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </PublicPage>
  );
}
