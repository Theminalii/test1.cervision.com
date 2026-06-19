import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";
import { PublicPage } from "@/components/shared/public-page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TRACKS } from "@/lib/mock-data";

export const Route = createFileRoute("/tracks")({
  head: () => ({ meta: [
    { title: "Tracks — KAFD Hackathon" },
    { name: "description", content: "Explore the five challenge tracks of the KAFD Hackathon." },
    { property: "og:title", content: "Tracks — KAFD Hackathon" },
    { property: "og:description", content: "Smart City, FinTech, Sustainability, AI and Digital Experience." },
  ]}),
  component: TracksPage,
});

function TracksPage() {
  return (
    <PublicPage eyebrow="Tracks" title="Five tracks. One mission." description="Each track is shaped with KAFD stakeholders to ensure problems are real, scoped and high-impact.">
      <div className="grid gap-6 md:grid-cols-2">
        {TRACKS.map((t) => (
          <Card key={t.id} className="overflow-hidden p-0">
            <div className={`bg-gradient-to-r ${t.color} h-1.5`} />
            <div className="p-6">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-xl font-semibold">{t.name}</h3>
                <Badge variant="outline" className="border-gold/30 bg-gold/10 text-gold-foreground">{t.eligibility}</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{t.desc}</p>
              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <Layers className="size-3.5" /> Mentor-supported · Judge-evaluated
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PublicPage>
  );
}
