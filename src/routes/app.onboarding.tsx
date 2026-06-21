import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, FilePlus2, ArrowRight } from "lucide-react";
import { apiPost } from "@/lib/api-client";

export const Route = createFileRoute("/app/onboarding")({
  head: () => ({ meta: [{ title: "Get Started — KAFD Hackathon" }] }),
  component: Onboarding,
});

function Onboarding() {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const [teamName, setTeamName] = useState("");
  const [trackId, setTrackId] = useState("track_fintech");
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
              <div className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Team name</Label>
                  <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Atlas Capital" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Track</Label>
                  <select value={trackId} onChange={(e) => setTrackId(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="track_fintech">FinTech</option>
                    <option value="track_smart_city">Smart City</option>
                    <option value="track_sustainability">Sustainability</option>
                    <option value="track_ai_automation">AI & Automation</option>
                    <option value="track_digital_experience">Digital Experience</option>
                  </select>
                </div>
                <Button variant="kafd" className="w-full" onClick={async () => {
                  try {
                    await apiPost("/api/teams", { name: teamName, track_id: trackId });
                    await queryClient.invalidateQueries({ queryKey: ["auth-context"] });
                    await queryClient.invalidateQueries({ queryKey: ["my-team"] });
                    toast.success("Team created");
                    nav({ to: "/app/dashboard" });
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Team creation failed");
                  }
                }}>
                  Create team <ArrowRight className="size-4" />
                </Button>
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
