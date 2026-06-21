import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserPlus } from "lucide-react";
import { useApiQuery } from "@/lib/api-client";
import { EmptyState } from "@/components/shared/empty-state";

export const Route = createFileRoute("/app/team")({
  head: () => ({ meta: [{ title: "Team Profile — KAFD" }] }),
  component: TeamPage,
});

function TeamPage() {
  const { data: team, isLoading: teamLoading } = useApiQuery<{
    id: string;
    name: string;
    status: string;
    track_name: string | null;
    team_role: "lead" | "member";
  } | null>(["my-team"], "/api/teams/my");
  const { data: members = [], isLoading: membersLoading } = useApiQuery<Array<{
    membershipId: string;
    fullName: string;
    email: string;
    teamRole: "lead" | "member";
    status: string;
  }>>(["team-members", team?.id], team?.id ? `/api/teams/${team.id}/members` : "", Boolean(team?.id));

  return (
    <AppShell role="team_lead" title="Team Profile" breadcrumbs={[{ label: "Team Lead" }, { label: "Team" }]}
      actions={<Button asChild variant="kafd" size="sm"><Link to="/app/team/invite"><UserPlus className="size-4" />Invite</Link></Button>}>
      {teamLoading ? (
        <Card className="p-6 text-sm text-muted-foreground">Loading team…</Card>
      ) : !team ? (
        <EmptyState
          icon={Users}
          title="No team yet"
          description="Create your team from onboarding, then return here to manage members."
        />
      ) : (
      <div className="grid gap-6">
        <Card className="p-6">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Team</div>
              <h2 className="mt-1 font-display text-2xl font-bold">{team.name}</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">Manage your team, invites and active member roster.</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">{team.track_name ?? "No track yet"}</Badge>
                <Badge variant="outline">{members.length} members</Badge>
                <Badge variant="outline">{team.status}</Badge>
              </div>
            </div>
            <div className="gold-gradient grid size-20 place-items-center rounded-2xl">
              <span className="font-display text-3xl font-bold text-primary">{team.name[0]?.toUpperCase() ?? "T"}</span>
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h3 className="font-display font-semibold">Members</h3>
            <span className="text-xs text-muted-foreground">{members.length} active</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membersLoading ? (
                <TableRow><TableCell colSpan={4} className="text-sm text-muted-foreground">Loading members…</TableCell></TableRow>
              ) : members.map((m) => (
                <TableRow key={m.membershipId}>
                  <TableCell className="font-medium">{m.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{m.email}</TableCell>
                  <TableCell>
                    <Badge variant={m.teamRole === "lead" ? "default" : "outline"} className={m.teamRole === "lead" ? "bg-gold/15 text-gold-foreground border-gold/30" : ""}>
                      {m.teamRole === "lead" ? "Lead" : "Member"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={m.status === "active" ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/15 text-warning-foreground"}>
                      {m.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
      )}
    </AppShell>
  );
}
