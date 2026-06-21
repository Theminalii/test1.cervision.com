import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { MessageSquare, Send } from "lucide-react";
import { apiPost, useApiQuery } from "@/lib/api-client";

export const Route = createFileRoute("/app/submission/clarification")({
  head: () => ({ meta: [{ title: "Clarification Required — KAFD" }] }),
  component: ClarificationPage,
});

function ClarificationPage() {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const { data: submission } = useApiQuery<any | null>(["my-submission"], "/api/submissions/my");
  const { data: notes = [] } = useApiQuery<any[]>(
    ["clarification-notes", submission?.id],
    submission?.id ? `/api/submissions/${submission.id}/clarification-notes` : "",
    Boolean(submission?.id),
  );
  const [resp, setResp] = useState("");

  return (
    <AppShell role="team_lead" title="Clarification Required" breadcrumbs={[{ label: "Team Lead" }, { label: "Submission", to: "/app/submission" }, { label: "Clarification" }]}>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="border-warning/30 bg-warning/5 p-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-warning-foreground" />
            <StatusBadge status="Needs Clarification" label="Clarification Needed" />
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold">Mentor notes</h3>
          <p className="mt-2 text-xs text-muted-foreground">
            {notes[0] ? `${notes[0].mentorName} · ${new Date(notes[0].createdAt).toLocaleString()}` : "No mentor note yet"}
          </p>
          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            <p>{notes[0]?.note ?? "Your mentor has not left clarification notes yet."}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold">Your response</h3>
          <p className="mt-1 text-sm text-muted-foreground">Address each point and resubmit when ready.</p>
          <Textarea rows={10} className="mt-4" value={resp} onChange={(e) => setResp(e.target.value)} />
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => toast.success("Update the submission in the builder, then return here to resubmit.")}>Save draft</Button>
            <Button variant="kafd" onClick={async () => {
              try {
                if (!submission?.id) return;
                await apiPost(`/api/submissions/${submission.id}/resubmit-for-review`, {});
                await queryClient.invalidateQueries({ queryKey: ["my-submission"] });
                toast.success("Resubmitted for review");
                nav({ to: "/app/submission/status" });
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Resubmit failed");
              }
            }}>
              <Send className="size-4" />Resubmit for Review
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
