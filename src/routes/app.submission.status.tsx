import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { useApiQuery } from "@/lib/api-client";

export const Route = createFileRoute("/app/submission/status")({
  head: () => ({ meta: [{ title: "Submission Status — KAFD" }] }),
  component: StatusPage,
});

function StatusPage() {
  const { data: submission, isLoading } = useApiQuery<any | null>(["my-submission"], "/api/submissions/my");
  const { data: statusData } = useApiQuery<any>(
    ["submission-status", submission?.id],
    submission?.id ? `/api/submissions/${submission.id}/status` : "",
    Boolean(submission?.id),
  );

  return (
    <AppShell role="team_lead" title="Submission Status" breadcrumbs={[{ label: "Team Lead" }, { label: "Submission", to: "/app/submission" }, { label: "Status" }]}>
      {isLoading || !submission || !statusData ? (
        <Card className="p-6 text-sm text-muted-foreground">Loading status…</Card>
      ) : (
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <h3 className="font-display font-semibold">Lifecycle</h3>
          <div className="mt-6">
            <Timeline items={statusData.history.map((item: any, index: number) => ({
              label: item.status,
              date: new Date(item.createdAt).toLocaleString(),
              status: index === statusData.history.length - 1 ? "active" : "done",
              description: item.note ?? undefined,
            }))} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Current Status</div>
          <div className="mt-3"><StatusBadge status={statusData.current_status} label={statusData.participant_label} /></div>
          <div className="mt-6 space-y-4 text-sm">
            <Row k="Submitted" v={statusData.timestamps.submitted_at ? new Date(statusData.timestamps.submitted_at).toLocaleString() : "Not submitted"} />
            <Row k="Updated" v={new Date(statusData.timestamps.updated_at).toLocaleString()} />
            <Row k="Mentor Notes" v={String(statusData.mentor_notes.length)} />
            <Row k="Next Actions" v={statusData.next_allowed_actions.join(", ") || "None"} />
          </div>
        </Card>
      </div>
      )}
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
