import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { PublicPage } from "@/components/shared/public-page";
import { Card } from "@/components/ui/card";
import { PRIZES } from "@/lib/mock-data";

export const Route = createFileRoute("/prizes")({
  head: () => ({ meta: [
    { title: "Prizes — KAFD Hackathon" },
    { name: "description", content: "Prize pool and winner categories for the KAFD Hackathon." },
    { property: "og:title", content: "Prizes — KAFD Hackathon" },
    { property: "og:description", content: "Cash awards, residency access and investor introductions." },
  ]}),
  component: PrizesPage,
});

function PrizesPage() {
  return (
    <PublicPage eyebrow="Rewards" title="A prize pool worth competing for." description="Top teams are recognized at the KAFD Conference Center with cash awards and post-program opportunities.">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PRIZES.map((p, i) => (
          <Card key={i} className={`p-6 ${i === 0 ? "border-gold/40 bg-gradient-to-br from-gold/15 to-transparent shadow-md" : ""}`}>
            <Trophy className={`size-6 ${i === 0 ? "text-gold-foreground" : "text-muted-foreground"}`} />
            <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{p.rank}</div>
            <div className="mt-1 font-display text-3xl font-bold">{p.amount}</div>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              {p.perks.map((perk, j) => <li key={j} className="flex gap-2"><span className="text-gold-foreground">◆</span> {perk}</li>)}
            </ul>
          </Card>
        ))}
      </div>
    </PublicPage>
  );
}
