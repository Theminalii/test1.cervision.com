import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiPost, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/app/team/invite")({
  head: () => ({ meta: [{ title: "Invite Members — KAFD" }] }),
  component: InvitePage,
});

function InvitePage() {
  const [email, setEmail] = useState("");
  const queryClient = useQueryClient();
  const { data: team } = useApiQuery<{ id: string; name: string } | null>(["my-team"], "/api/teams/my");
  const { data: invites = [] } = useApiQuery<Array<{ id: string; email: string; createdAt: string; status: string }>>(
    ["team-invites", team?.id],
    team?.id ? `/api/teams/${team.id}/invites` : "",
    Boolean(team?.id),
  );
  return (
    <AppShell role="team_lead" title="Invite Team Members" breadcrumbs={[{ label: "Team Lead" }, { label: "Team", to: "/app/team" }, { label: "Invite" }]}>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="p-6">
          <h3 className="font-display text-base font-semibold">Send invitation</h3>
          <p className="mt-1 text-sm text-muted-foreground">Invite up to 4 additional members.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!team?.id) return;
              try {
                await apiPost(`/api/teams/${team.id}/invites`, { email });
                await queryClient.invalidateQueries({ queryKey: ["team-invites", team.id] });
                toast.success(`Invitation sent to ${email}`);
                setEmail("");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Invite failed");
              }
            }}
            className="mt-5 space-y-4"
          >
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@email.com" />
            </div>
            <Button type="submit" variant="kafd" className="w-full">Send invitation</Button>
          </form>
        </Card>

        <Card className="p-0">
          <div className="border-b border-border p-5">
            <h3 className="font-display font-semibold">Invitation history</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Email</TableHead><TableHead>Sent</TableHead><TableHead>Status</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {invites.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium">{h.email}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(h.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell><Badge variant="outline" className={h.status === "accepted" ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/15 text-warning-foreground"}>{h.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppShell>
  );
}
