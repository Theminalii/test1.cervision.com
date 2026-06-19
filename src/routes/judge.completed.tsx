import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SUBMISSIONS } from "@/lib/mock-data";

export const Route = createFileRoute("/judge/completed")({
  head: () => ({ meta: [{ title: "Completed Evaluations — KAFD" }] }),
  component: () => (
    <AppShell role="judge" title="Completed Evaluations" breadcrumbs={[{ label: "Judge" }, { label: "Completed" }]}>
      <Card className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Team</TableHead><TableHead>Track</TableHead><TableHead className="text-right">Score</TableHead></TableRow></TableHeader>
          <TableBody>
            {SUBMISSIONS.slice(0, 8).map((s, i) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.title}</TableCell>
                <TableCell>{s.team}</TableCell>
                <TableCell className="text-muted-foreground">{s.track}</TableCell>
                <TableCell className="text-right font-mono font-semibold">{78 + ((i * 3) % 18)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  ),
});
