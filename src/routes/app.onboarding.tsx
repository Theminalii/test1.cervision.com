import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FilePlus2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/app/onboarding")({
  head: () => ({ meta: [{ title: "Get Started — KAFD Hackathon" }] }),
  component: Onboarding,
});

function Onboarding() {
  return (
    <AppShell role="participant" title="Welcome to KAFD Hackathon" breadcrumbs={[{ label: "Participant" }, { label: "Get Started" }]}>
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="overflow-hidden p-0">
          <div className="kafd-gradient p-8 text-primary-foreground">
            <div className="text-xs uppercase tracking-widest text-gold">Step 1 of 2</div>
            <h2 className="mt-2 font-display text-2xl font-bold">Join or create a team</h2>
            <p className="mt-2 max-w-lg text-primary-foreground/80">
              To compete in the KAFD Hackathon, you must be part of a team of 2–5 members.
            </p>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <Card className="p-5">
              <Users className="size-6 text-primary" />
              <h3 className="mt-3 font-display font-semibold">Join an existing team</h3>
              <p className="mt-1 text-sm text-muted-foreground">If you received an invitation, accept it from your inbox.</p>
              <Button variant="outline" className="mt-4 w-full">Open invitations</Button>
            </Card>
            <Card className="p-5 border-gold/40 bg-gradient-to-br from-gold/8 to-transparent">
              <FilePlus2 className="size-6 text-gold-foreground" />
              <h3 className="mt-3 font-display font-semibold">Create a new team</h3>
              <p className="mt-1 text-sm text-muted-foreground">Become the team lead and invite members.</p>
              <Button asChild variant="kafd" className="mt-4 w-full">
                <Link to="/app/dashboard">Create team <ArrowRight className="size-4" /></Link>
              </Button>
            </Card>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
