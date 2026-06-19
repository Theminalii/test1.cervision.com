import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SUBMISSIONS } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/scores")({
  head: () => ({ meta: [{ title: "Scores — Admin — KAFD" }] }),
  component: () => {
    const rows = SUBMISSIONS.map((s, i) => ({ ...s, score: 70 + ((i * 7) % 30), judges: 3, completed: i % 4 !== 0 ? 3 : 2 })).sort((a, b) => b.score - a.score);
    return (
      <AppShell role="admin" title="Scores" breadcrumbs={[{ label: "Admin" }, { label: "Scores" }]}>
        <Card className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Rank</TableHead><TableHead>Project</TableHead><TableHead>Team</TableHead><TableHead>Judge progress</TableHead><TableHead className="text-right">Score</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">{i + 1}</TableCell>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell>{r.team}</TableCell>
                  <TableCell><Badge variant="outline" className={r.completed === r.judges ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/15 text-warning-foreground"}>{r.completed} / {r.judges}</Badge></TableCell>
                  <TableCell className="text-right font-mono font-bold">{r.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </AppShell>
    );
  },
});
