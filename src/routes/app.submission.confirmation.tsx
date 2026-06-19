import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/app/submission/confirmation")({
  head: () => ({ meta: [{ title: "Submission Confirmed — KAFD" }] }),
  component: Confirmation,
});

function Confirmation() {
  return (
    <AppShell role="team_lead" title="Submitted">
      <div className="mx-auto max-w-xl">
        <Card className="p-10 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-8" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold">Submission received</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your submission has been queued for mentor review. You'll be notified once a decision is made.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button asChild variant="kafd"><Link to="/app/submission/status">View status</Link></Button>
            <Button asChild variant="outline"><Link to="/app/dashboard">Back to dashboard</Link></Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
