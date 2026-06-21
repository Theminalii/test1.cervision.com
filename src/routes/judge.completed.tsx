import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApiQuery } from "@/lib/api-client";

export const Route = createFileRoute("/judge/completed")({
  head: () => ({ meta: [{ title: "Completed Evaluations — KAFD" }] }),
  component: () => {
    const { data = [] } = useApiQuery<Array<any>>(["judge-completed"], "/api/judge/completed");
    return (
    <AppShell role="judge" title="Completed Evaluations" breadcrumbs={[{ label: "Judge" }, { label: "Completed" }]}>
      <Card className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Team</TableHead><TableHead>Track</TableHead><TableHead className="text-right">Score</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.map((s) => (
              <TableRow key={s.assignmentId}>
                <TableCell className="font-medium">{s.title}</TableCell>
                <TableCell>{s.teamName}</TableCell>
                <TableCell className="text-muted-foreground">{s.trackName}</TableCell>
                <TableCell className="text-right font-mono font-semibold">{s.completedAt ? "Done" : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  )},
});
