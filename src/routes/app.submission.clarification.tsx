import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { MessageSquare, Send } from "lucide-react";

export const Route = createFileRoute("/app/submission/clarification")({
  head: () => ({ meta: [{ title: "Clarification Required — KAFD" }] }),
  component: ClarificationPage,
});

function ClarificationPage() {
  const nav = useNavigate();
  const [resp, setResp] = useState("Updated the architecture section with the FIX 5.0 adapter detail. Added two scalability scenarios under Impact.");

  return (
    <AppShell role="team_lead" title="Clarification Required" breadcrumbs={[{ label: "Team Lead" }, { label: "Submission", to: "/app/submission" }, { label: "Clarification" }]}>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="border-warning/30 bg-warning/5 p-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-warning-foreground" />
            <StatusBadge status="Needs Clarification" label="Clarification Needed" />
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold">Mentor notes</h3>
          <p className="mt-2 text-xs text-muted-foreground">Submitted by Dr. Hassan Al-Otaibi · Oct 22, 2026</p>
          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            <p>The submission is strong but needs clarification on:</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Technical detail of the FIX 5.0 gateway adapter</li>
              <li>Scalability scenarios beyond Saudi market</li>
              <li>Specific impact metrics for tier-2 issuers</li>
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold">Your response</h3>
          <p className="mt-1 text-sm text-muted-foreground">Address each point and resubmit when ready.</p>
          <Textarea rows={10} className="mt-4" value={resp} onChange={(e) => setResp(e.target.value)} />
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => toast.success("Draft saved")}>Save draft</Button>
            <Button variant="kafd" onClick={() => { toast.success("Resubmitted for review"); nav({ to: "/app/submission/status" }); }}>
              <Send className="size-4" />Resubmit for Review
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
