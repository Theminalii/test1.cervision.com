import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { useApiQuery } from "@/lib/api-client";

export const Route = createFileRoute("/mentor/review-history")({
  head: () => ({ meta: [{ title: "Review History — KAFD" }] }),
  component: () => {
    const { data = [] } = useApiQuery<Array<any>>(["mentor-history"], "/api/mentor/review-history");
    return (
    <AppShell role="mentor" title="Review History" breadcrumbs={[{ label: "Mentor" }, { label: "Review History" }]}>
      <Card className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Team</TableHead><TableHead>Decision</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.map(s => (
              <TableRow key={s.assignmentId}>
                <TableCell className="font-medium">{s.title}</TableCell>
                <TableCell>{s.teamName}</TableCell>
                <TableCell><StatusBadge status={s.submissionStatus} /></TableCell>
                <TableCell className="text-muted-foreground">{s.completedAt ? new Date(s.completedAt).toLocaleDateString() : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  )},
});
