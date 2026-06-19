import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { SUBMISSIONS } from "@/lib/mock-data";

export const Route = createFileRoute("/mentor/review-history")({
  head: () => ({ meta: [{ title: "Review History — KAFD" }] }),
  component: () => (
    <AppShell role="mentor" title="Review History" breadcrumbs={[{ label: "Mentor" }, { label: "Review History" }]}>
      <Card className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Team</TableHead><TableHead>Decision</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
          <TableBody>
            {SUBMISSIONS.slice(0, 10).map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.title}</TableCell>
                <TableCell>{s.team}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell className="text-muted-foreground">{s.updatedAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  ),
});
