import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/member/team")({
  head: () => ({ meta: [{ title: "Team — KAFD" }] }),
  component: () => {
    const MEMBERS = [
      { name: "Sara Al-Otaibi", role: "Lead" },
      { name: "Mohammed Al-Qahtani", role: "Member" },
      { name: "Fatima Al-Harbi", role: "Member" },
      { name: "Khalid Al-Saud", role: "Member" },
    ];
    return (
      <AppShell role="team_member" title="Team" breadcrumbs={[{ label: "Team Member" }, { label: "Team" }]}>
        <Card className="p-6">
          <h2 className="font-display text-xl font-bold">Atlas Capital</h2>
          <p className="mt-1 text-sm text-muted-foreground">FinTech track · 4 members · Riyadh</p>
        </Card>
        <Card className="mt-6 p-0">
          <div className="border-b border-border p-5"><h3 className="font-display font-semibold">Members</h3></div>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead></TableRow></TableHeader>
            <TableBody>
              {MEMBERS.map((m) => (
                <TableRow key={m.name}><TableCell className="font-medium">{m.name}</TableCell><TableCell><Badge variant="outline" className={m.role === "Lead" ? "border-gold/30 bg-gold/10 text-gold-foreground" : ""}>{m.role}</Badge></TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </AppShell>
    );
  },
});
