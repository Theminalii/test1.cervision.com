import { createFileRoute } from "@tanstack/react-router";
import { Target, Users, Sparkles, Building2 } from "lucide-react";
import { PublicPage } from "@/components/shared/public-page";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About — KAFD Hackathon" },
    { name: "description", content: "About the KAFD Hackathon: goals, eligibility and reasons to join the Kingdom's flagship innovation program." },
    { property: "og:title", content: "About — KAFD Hackathon" },
    { property: "og:description", content: "Goals, eligibility and the mission behind the KAFD Hackathon." },
  ]}),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicPage
      eyebrow="About"
      title="An official KAFD innovation program."
      description="The KAFD Hackathon brings together the Kingdom's best builders to solve real problems across finance, smart cities and sustainability — under one roof, with mentorship and judging from industry leaders."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <InfoCard icon={Target} title="Our goals" body="Accelerate high-impact prototypes, surface Saudi-grown talent, and create commercial pathways inside the KAFD ecosystem." />
        <InfoCard icon={Users} title="Who can participate" body="Teams of 2–5 builders, designers and domain experts. Aged 18+, residing in KSA or invited through international partner programs." />
        <InfoCard icon={Sparkles} title="Why join" body="Cash prizes, residency program access, investor introductions, and a platform to ship inside the Kingdom's most prestigious financial district." />
        <InfoCard icon={Building2} title="Backed by KAFD" body="Operated under the KAFD Authority innovation mandate, with partners across regulation, capital markets and enterprise." />
      </div>

      <div className="mt-14 grid gap-10 rounded-2xl border border-border bg-muted/30 p-8 md:grid-cols-3">
        {[
          { k: "120+", v: "Registered builders" },
          { k: "34", v: "Active teams" },
          { k: "18", v: "Mentors and judges" },
        ].map((s) => (
          <div key={s.v}>
            <div className="font-display text-4xl font-bold">{s.k}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.v}</div>
          </div>
        ))}
      </div>
    </PublicPage>
  );
}

function InfoCard({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <Card className="p-6">
      <Icon className="size-6 text-primary" />
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </Card>
  );
}
