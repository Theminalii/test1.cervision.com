import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";

export const Route = createFileRoute("/app/submission/status")({
  head: () => ({ meta: [{ title: "Submission Status — KAFD" }] }),
  component: StatusPage,
});

function StatusPage() {
  return (
    <AppShell role="team_lead" title="Submission Status" breadcrumbs={[{ label: "Team Lead" }, { label: "Submission", to: "/app/submission" }, { label: "Status" }]}>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <h3 className="font-display font-semibold">Lifecycle</h3>
          <div className="mt-6">
            <Timeline items={[
              { label: "Draft", date: "Oct 16, 2026", status: "done" },
              { label: "Submitted for Review", date: "Oct 18, 2026", status: "done" },
              { label: "Under Mentor Review", date: "Oct 19, 2026", status: "active", description: "Assigned to Dr. Hassan Al-Otaibi" },
              { label: "Approved for Judging", status: "upcoming" },
              { label: "With Judges", status: "upcoming" },
              { label: "Judging Complete", status: "upcoming" },
            ]} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Current Status</div>
          <div className="mt-3"><StatusBadge status="Submitted for Review" label="Under Mentor Review" /></div>
          <div className="mt-6 space-y-4 text-sm">
            <Row k="Mentor" v="Dr. Hassan Al-Otaibi" />
            <Row k="Submitted" v="Oct 18, 2026" />
            <Row k="Review deadline" v="Nov 1, 2026" />
            <Row k="Edits allowed" v="No (after submission)" />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-0">
      <span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span>
    </div>
  );
}
