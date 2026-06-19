import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/shared/public-page";
import { Timeline } from "@/components/shared/timeline";
import { Card } from "@/components/ui/card";
import { TIMELINE } from "@/lib/mock-data";

export const Route = createFileRoute("/timeline")({
  head: () => ({ meta: [
    { title: "Timeline — KAFD Hackathon" },
    { name: "description", content: "Key dates for the KAFD Hackathon: registration, submission, review, judging and winner announcement." },
    { property: "og:title", content: "Timeline — KAFD Hackathon" },
    { property: "og:description", content: "Key dates and milestones for the hackathon." },
  ]}),
  component: TimelinePage,
});

function TimelinePage() {
  return (
    <PublicPage eyebrow="Schedule" title="Timeline and key dates" description="Plan your team's work around official KAFD program milestones.">
      <Card className="p-8">
        <Timeline items={TIMELINE.map(t => ({ label: t.label, date: t.date, status: t.status as "done" | "active" | "upcoming" }))} />
      </Card>
    </PublicPage>
  );
}
