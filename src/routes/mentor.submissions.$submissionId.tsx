import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { CheckCircle2, MessageSquare } from "lucide-react";
import { apiPost, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/mentor/submissions/$submissionId")({
  head: () => ({ meta: [{ title: "Review Submission — KAFD" }] }),
  component: MentorDetail,
});

function MentorDetail() {
  const { submissionId } = Route.useParams();
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const { data: sub, isLoading } = useApiQuery<any>(["mentor-submission", submissionId], `/api/mentor/submissions/${submissionId}`);
  const [note, setNote] = useState("");

  return (
    <AppShell role="mentor" title={sub?.title ?? "Review Submission"} breadcrumbs={[{ label: "Mentor" }, { label: "Submissions", to: "/mentor/submissions" }, { label: submissionId }]}>
      {isLoading || !sub ? (
        <Card className="p-6 text-sm text-muted-foreground">Loading submission…</Card>
      ) : (
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden p-0">
            <div className="kafd-gradient p-6 text-primary-foreground">
              <div className="text-xs uppercase tracking-widest text-gold">{sub.trackName} · {sub.teamName}</div>
              <h2 className="mt-2 font-display text-xl font-bold">{sub.title}</h2>
              <p className="mt-2 text-primary-foreground/85">{sub.shortSummary}</p>
            </div>
            <div className="grid gap-6 p-6 sm:grid-cols-2">
              {[
                ["Problem", sub.problem],
                ["Solution", sub.solution],
                ["Impact", sub.impact],
                ["Technical", sub.technicalDescription],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{k}</div>
                  <p className="mt-2 text-sm">{v}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-display font-semibold">Links</h3>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              {sub.demoUrl ? <div className="rounded-md border border-border bg-muted/30 px-3 py-2">Demo: {sub.demoUrl}</div> : null}
              {sub.deckUrl ? <div className="rounded-md border border-border bg-muted/30 px-3 py-2">Deck: {sub.deckUrl}</div> : null}
              {sub.githubUrl ? <div className="rounded-md border border-border bg-muted/30 px-3 py-2">GitHub: {sub.githubUrl}</div> : null}
              {sub.videoUrl ? <div className="rounded-md border border-border bg-muted/30 px-3 py-2">Video: {sub.videoUrl}</div> : null}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Current Status</div>
          <div className="mt-2"><StatusBadge status={sub.status} /></div>
          <div className="mt-6">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Clarification note</div>
            <Textarea rows={6} className="mt-2" placeholder="Add a note for the team if returning for clarification…" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="mt-5 grid gap-2">
            <Button variant="kafd" onClick={async () => { try { await apiPost(`/api/mentor/submissions/${submissionId}/approve`, {}); await queryClient.invalidateQueries({ queryKey: ["mentor-submissions"] }); toast.success("Approved for judging"); nav({ to: "/mentor/submissions" }); } catch (error) { toast.error(error instanceof Error ? error.message : "Approve failed"); } }}>
              <CheckCircle2 className="size-4" />Approve for judging
            </Button>
            <Button variant="outline" onClick={async () => { try { await apiPost(`/api/mentor/submissions/${submissionId}/return-for-clarification`, { note }); await queryClient.invalidateQueries({ queryKey: ["mentor-submissions"] }); toast.success("Returned for clarification"); nav({ to: "/mentor/submissions" }); } catch (error) { toast.error(error instanceof Error ? error.message : "Clarification failed"); } }}>
              <MessageSquare className="size-4" />Return for clarification
            </Button>
          </div>
        </Card>
      </div>
      )}
    </AppShell>
  );
}
