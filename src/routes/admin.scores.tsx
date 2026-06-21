import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApiQuery } from "@/lib/api-client";

export const Route = createFileRoute("/admin/scores")({
  head: () => ({ meta: [{ title: "Scores — Admin — KAFD" }] }),
  component: () => {
    const { data: rows = [] } = useApiQuery<Array<any>>(["admin-scores"], "/api/admin/scores");
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
                  <TableCell>{r.teamName}</TableCell>
                  <TableCell><Badge variant="outline">{r.score_count} score(s)</Badge></TableCell>
                  <TableCell className="text-right font-mono font-bold">{r.average_score ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </AppShell>
    );
  },
});
