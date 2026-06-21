import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { MetricCard } from "@/components/shared/metric-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, MessageSquare, RefreshCw, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useApiQuery } from "@/lib/api-client";

export const Route = createFileRoute("/mentor/dashboard")({
  head: () => ({ meta: [{ title: "Mentor Dashboard — KAFD" }] }),
  component: () => {
    const { data, isLoading } = useApiQuery<any>(["mentor-dashboard"], "/api/mentor/dashboard");
    return (
    <AppShell role="mentor" title="Mentor Dashboard" breadcrumbs={[{ label: "Mentor" }, { label: "Dashboard" }]}>
      {isLoading || !data ? (
        <Card className="p-6 text-sm text-muted-foreground">Loading dashboard…</Card>
      ) : (
      <>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pending reviews" value={data.pending_reviews} icon={ClipboardList} tone="warning" />
        <MetricCard label="Needs clarification" value={data.needs_clarification} icon={MessageSquare} tone="info" />
        <MetricCard label="Resubmitted" value={data.resubmitted} icon={RefreshCw} tone="info" />
        <MetricCard label="Approved" value={data.approved} icon={CheckCircle2} tone="success" />
      </div>

      <Card className="mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-semibold">Review performance</h3>
            <p className="text-sm text-muted-foreground">You're ahead of schedule. Keep it up.</p>
          </div>
          <Button asChild variant="kafd"><Link to="/mentor/submissions">Open submissions</Link></Button>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <div className="flex justify-between text-xs text-muted-foreground"><span>Reviews completed</span><span>{data.completed_reviews} / {data.total_assigned}</span></div>
            <Progress value={data.total_assigned ? Math.round((data.completed_reviews / data.total_assigned) * 100) : 0} className="mt-2" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground"><span>Active queue</span><span>{data.pending_reviews}</span></div>
            <Progress value={Math.min(data.pending_reviews * 20, 100)} className="mt-2" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground"><span>Approved rate</span><span>{data.approved}</span></div>
            <Progress value={data.total_assigned ? Math.round((data.approved / data.total_assigned) * 100) : 0} className="mt-2" />
          </div>
        </div>
      </Card>
      </>
      )}
    </AppShell>
  )},
});
