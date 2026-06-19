import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { TEAMS } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/teams")({
  head: () => ({ meta: [{ title: "Teams — Admin — KAFD" }] }),
  component: () => (
    <AppShell role="admin" title="Teams" breadcrumbs={[{ label: "Admin" }, { label: "Teams" }]}>
      <Card className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Team</TableHead><TableHead>Lead</TableHead><TableHead>Track</TableHead><TableHead>Members</TableHead><TableHead>Submission</TableHead></TableRow></TableHeader>
          <TableBody>
            {TEAMS.map(t => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>{t.lead}</TableCell>
                <TableCell className="text-muted-foreground">{t.track}</TableCell>
                <TableCell>{t.members}</TableCell>
                <TableCell><StatusBadge status={t.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  ),
});
