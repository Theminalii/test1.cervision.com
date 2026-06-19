import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_SUBMISSION } from "@/lib/mock-data";

export const Route = createFileRoute("/member/submission")({
  head: () => ({ meta: [{ title: "Submission — KAFD" }] }),
  component: () => {
    const d = SAMPLE_SUBMISSION;
    return (
      <AppShell role="team_member" title="Submission (Read-only)" breadcrumbs={[{ label: "Team Member" }, { label: "Submission" }]}>
        <Card className="overflow-hidden p-0">
          <div className="kafd-gradient p-8 text-primary-foreground">
            <Badge className="bg-gold text-primary">{d.track}</Badge>
            <h2 className="mt-3 font-display text-2xl font-bold">{d.title}</h2>
            <p className="mt-2 max-w-2xl text-primary-foreground/85">{d.summary}</p>
          </div>
          <div className="grid gap-6 p-8 sm:grid-cols-2">
            {[
              ["Problem", d.problem], ["Solution", d.solution], ["Impact", d.impact], ["Technical", d.technical],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{k}</div>
                <p className="mt-2 text-sm">{v}</p>
              </div>
            ))}
          </div>
        </Card>
      </AppShell>
    );
  },
});
