import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus } from "lucide-react";

export const Route = createFileRoute("/app/team")({
  head: () => ({ meta: [{ title: "Team Profile — KAFD" }] }),
  component: TeamPage,
});

const MEMBERS = [
  { name: "Sara Al-Otaibi", email: "sara@atlas.sa", role: "Lead", status: "Active" },
  { name: "Mohammed Al-Qahtani", email: "mo@atlas.sa", role: "Member", status: "Active" },
  { name: "Fatima Al-Harbi", email: "fatima@atlas.sa", role: "Member", status: "Active" },
  { name: "Khalid Al-Saud", email: "khalid@atlas.sa", role: "Member", status: "Invited" },
];

function TeamPage() {
  return (
    <AppShell role="team_lead" title="Team Profile" breadcrumbs={[{ label: "Team Lead" }, { label: "Team" }]}
      actions={<Button asChild variant="kafd" size="sm"><Link to="/app/team/invite"><UserPlus className="size-4" />Invite</Link></Button>}>
      <div className="grid gap-6">
        <Card className="p-6">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Team</div>
              <h2 className="mt-1 font-display text-2xl font-bold">Atlas Capital</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Unified capital-markets API for issuers and asset managers across the GCC.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">FinTech</Badge>
                <Badge variant="outline">4 members</Badge>
                <Badge variant="outline">Riyadh</Badge>
              </div>
            </div>
            <div className="gold-gradient grid size-20 place-items-center rounded-2xl">
              <span className="font-display text-3xl font-bold text-primary">A</span>
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h3 className="font-display font-semibold">Members</h3>
            <span className="text-xs text-muted-foreground">{MEMBERS.length} of 5</span>
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
              {MEMBERS.map((m) => (
                <TableRow key={m.email}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-muted-foreground">{m.email}</TableCell>
                  <TableCell>
                    <Badge variant={m.role === "Lead" ? "default" : "outline"} className={m.role === "Lead" ? "bg-gold/15 text-gold-foreground border-gold/30" : ""}>{m.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={m.status === "Active" ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/15 text-warning-foreground"}>{m.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppShell>
  );
}
