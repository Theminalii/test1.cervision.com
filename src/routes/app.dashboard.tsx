import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { CheckCircle2, Circle, FileText, Users, Send } from "lucide-react";
import { TIMELINE } from "@/lib/mock-data";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({ meta: [{ title: "Team Lead Dashboard — KAFD" }] }),
  component: TeamLeadDashboard,
});

const CHECKLIST = [
  { label: "Complete team profile", done: true },
  { label: "Invite all team members", done: true },
  { label: "Draft submission", done: true },
  { label: "Submit for mentor review", done: false },
  { label: "Address mentor feedback (if any)", done: false },
];

function TeamLeadDashboard() {
  return (
    <AppShell role="team_lead" title="Team Dashboard" breadcrumbs={[{ label: "Team Lead" }, { label: "Dashboard" }]}>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Team</div>
              <h2 className="mt-1 font-display text-2xl font-bold">Atlas Capital</h2>
              <p className="mt-1 text-sm text-muted-foreground">Track: FinTech · 4 members</p>
            </div>
            <StatusBadge status="Draft" label="Under Mentor Review" />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Mini label="Team members" value="4 / 5" />
            <Mini label="Submission completion" value="86%" />
            <Mini label="Mentor review" value="Pending" />
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Submission readiness</span><span>86%</span>
            </div>
            <Progress value={86} className="mt-2" />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild variant="kafd"><Link to="/app/submission"><FileText className="size-4" />Open Submission</Link></Button>
            <Button asChild variant="outline"><Link to="/app/team/invite"><Users className="size-4" />Invite Member</Link></Button>
            <Button asChild variant="outline"><Link to="/app/submission/preview"><Send className="size-4" />Preview & Submit</Link></Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-base font-semibold">Checklist</h3>
          <ul className="mt-4 space-y-3">
            {CHECKLIST.map((c) => (
              <li key={c.label} className="flex items-start gap-2.5 text-sm">
                {c.done ? <CheckCircle2 className="mt-0.5 size-4 text-success" /> : <Circle className="mt-0.5 size-4 text-muted-foreground" />}
                <span className={c.done ? "text-muted-foreground line-through" : ""}>{c.label}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 lg:col-span-3">
          <h3 className="font-display text-base font-semibold">Upcoming deadlines</h3>
          <div className="mt-5">
            <Timeline items={TIMELINE.slice(1, 6).map(t => ({ label: t.label, date: t.date, status: t.status as "done" | "active" | "upcoming" }))} />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl font-bold">{value}</div>
    </div>
  );
}
