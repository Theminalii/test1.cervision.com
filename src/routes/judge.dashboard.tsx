import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { MetricCard } from "@/components/shared/metric-card";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FolderKanban, ClipboardList, CheckCircle2, Calendar } from "lucide-react";

export const Route = createFileRoute("/judge/dashboard")({
  head: () => ({ meta: [{ title: "Judge Dashboard — KAFD" }] }),
  component: () => (
    <AppShell role="judge" title="Judge Dashboard" breadcrumbs={[{ label: "Judge" }, { label: "Dashboard" }]}>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Assigned projects" value={5} icon={FolderKanban} />
        <MetricCard label="Pending reviews" value={2} icon={ClipboardList} tone="warning" />
        <MetricCard label="Completed" value={3} icon={CheckCircle2} tone="success" />
        <MetricCard label="Deadline" value="Nov 5" icon={Calendar} tone="gold" hint="3 days remaining" />
      </div>
      <Card className="mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-semibold">Judging completion</h3>
            <p className="text-sm text-muted-foreground">3 of 5 projects evaluated</p>
          </div>
          <Button asChild variant="kafd"><Link to="/judge/projects">Open assignments</Link></Button>
        </div>
        <div className="mt-5">
          <div className="flex justify-between text-xs text-muted-foreground"><span>Completion</span><span>60%</span></div>
          <Progress value={60} className="mt-2" />
        </div>
      </Card>
    </AppShell>
  ),
});
