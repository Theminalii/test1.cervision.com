import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { MetricCard } from "@/components/shared/metric-card";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FolderKanban, ClipboardList, CheckCircle2, Calendar } from "lucide-react";
import { useApiQuery } from "@/lib/api-client";

export const Route = createFileRoute("/judge/dashboard")({
  head: () => ({ meta: [{ title: "Judge Dashboard — KAFD" }] }),
  component: () => {
    const { data, isLoading } = useApiQuery<any>(["judge-dashboard"], "/api/judge/dashboard");
    return (
    <AppShell role="judge" title="Judge Dashboard" breadcrumbs={[{ label: "Judge" }, { label: "Dashboard" }]}>
      {isLoading || !data ? (
        <Card className="p-6 text-sm text-muted-foreground">Loading dashboard…</Card>
      ) : (
      <>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Assigned projects" value={data.assigned_projects} icon={FolderKanban} />
        <MetricCard label="Pending reviews" value={data.pending_reviews} icon={ClipboardList} tone="warning" />
        <MetricCard label="Completed" value={data.completed_reviews} icon={CheckCircle2} tone="success" />
        <MetricCard label="Deadline" value={data.judging_deadline ? new Date(data.judging_deadline).toLocaleDateString() : "—"} icon={Calendar} tone="gold" />
      </div>
      <Card className="mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-semibold">Judging completion</h3>
            <p className="text-sm text-muted-foreground">{data.completed_reviews} of {data.assigned_projects} projects evaluated</p>
          </div>
          <Button asChild variant="kafd"><Link to="/judge/projects">Open assignments</Link></Button>
        </div>
        <div className="mt-5">
          <div className="flex justify-between text-xs text-muted-foreground"><span>Completion</span><span>{data.assigned_projects ? Math.round((data.completed_reviews / data.assigned_projects) * 100) : 0}%</span></div>
          <Progress value={data.assigned_projects ? Math.round((data.completed_reviews / data.assigned_projects) * 100) : 0} className="mt-2" />
        </div>
      </Card>
      </>
      )}
    </AppShell>
  )},
});
