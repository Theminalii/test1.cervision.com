import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { MetricCard } from "@/components/shared/metric-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, MessageSquare, RefreshCw, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/mentor/dashboard")({
  head: () => ({ meta: [{ title: "Mentor Dashboard — KAFD" }] }),
  component: () => (
    <AppShell role="mentor" title="Mentor Dashboard" breadcrumbs={[{ label: "Mentor" }, { label: "Dashboard" }]}>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pending reviews" value={4} icon={ClipboardList} tone="warning" />
        <MetricCard label="Needs clarification" value={2} icon={MessageSquare} tone="info" />
        <MetricCard label="Resubmitted" value={1} icon={RefreshCw} tone="info" />
        <MetricCard label="Approved" value={5} icon={CheckCircle2} tone="success" />
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
            <div className="flex justify-between text-xs text-muted-foreground"><span>Reviews completed</span><span>5 / 12</span></div>
            <Progress value={42} className="mt-2" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground"><span>Time to first review</span><span>2.3h avg</span></div>
            <Progress value={70} className="mt-2" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground"><span>Quality score</span><span>4.7 / 5</span></div>
            <Progress value={94} className="mt-2" />
          </div>
        </div>
      </Card>
    </AppShell>
  ),
});
