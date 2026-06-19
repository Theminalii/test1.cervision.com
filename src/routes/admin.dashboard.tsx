import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { MetricCard } from "@/components/shared/metric-card";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Users, UserCheck, Briefcase, FileText, ClipboardList, MessageSquare, RefreshCw,
  CheckCircle2, Send, Activity, Trophy, Star, ShieldCheck, Gavel, BarChart3
} from "lucide-react";
import { METRICS } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Command Center — KAFD" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const m = METRICS;
  return (
    <AppShell role="admin" title="Command Center" breadcrumbs={[{ label: "Admin" }, { label: "Command Center" }]}>
      <section>
        <SectionTitle title="People" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total participants" value={m.totalParticipants} icon={Users} tone="default" />
          <MetricCard label="Activated participants" value={m.activatedParticipants} icon={UserCheck} tone="success" />
          <MetricCard label="Teams created" value={m.teamsCreated} icon={Briefcase} tone="default" />
          <MetricCard label="Pending mentor reviews" value={m.pendingMentorReviews} icon={ShieldCheck} tone="warning" />
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle title="Workflow" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <MetricCard label="Draft submissions" value={m.draftSubmissions} icon={FileText} />
          <MetricCard label="Submitted for review" value={m.submittedForReview} icon={ClipboardList} tone="info" />
          <MetricCard label="Needs clarification" value={m.needsClarification} icon={MessageSquare} tone="warning" />
          <MetricCard label="Resubmitted" value={m.resubmittedForReview} icon={RefreshCw} tone="info" />
          <MetricCard label="Approved for judging" value={m.approvedForJudging} icon={CheckCircle2} tone="success" />
          <MetricCard label="Released to judges" value={m.releasedToJudges} icon={Send} tone="info" />
          <MetricCard label="Judging in progress" value={m.judgingInProgress} icon={Activity} tone="info" />
          <MetricCard label="Judged" value={m.judged} icon={Gavel} tone="success" />
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle title="Outcomes" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard label="Shortlisted" value={m.shortlisted} icon={Star} tone="gold" />
          <MetricCard label="Winners selected" value={m.winnersSelected} icon={Trophy} tone="gold" />
          <MetricCard label="Completed judge reviews" value={m.completedJudgeReviews} icon={BarChart3} tone="default" />
        </div>
      </section>

      <Card className="mt-8 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-semibold">Judging completion</h3>
            <p className="text-sm text-muted-foreground">Across all assigned judges</p>
          </div>
          <div className="font-display text-3xl font-bold text-primary">{m.judgingCompletionPct}%</div>
        </div>
        <Progress value={m.judgingCompletionPct} className="mt-4" />
      </Card>

      <Card className="mt-6 p-6">
        <h3 className="font-display font-semibold">Operational status</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Status label="Registration" status="Open" tone="success" />
          <Status label="Mentor reviews" status="In progress" tone="info" />
          <Status label="Judging" status="In progress" tone="info" />
        </div>
      </Card>
    </AppShell>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</div>;
}
function Status({ label, status, tone }: { label: string; status: string; tone: "success" | "info" | "warning" }) {
  const cls = { success: "bg-success/10 text-success", info: "bg-info/10 text-info", warning: "bg-warning/15 text-warning-foreground" }[tone];
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
        <span className="size-1.5 rounded-full bg-current" />{status}
      </div>
    </div>
  );
}
