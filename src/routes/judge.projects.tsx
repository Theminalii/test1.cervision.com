import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/lib/api-client";

export const Route = createFileRoute("/judge/projects")({
  head: () => ({ meta: [{ title: "Assigned Projects — Judge — KAFD" }] }),
  component: () => {
    const [filter, setFilter] = useState("all");
    const { data = [], isLoading } = useApiQuery<Array<any>>(["judge-projects"], "/api/judge/projects");
    const items = data.filter(s => filter === "all" || s.submissionStatus === filter);
    return (
      <AppShell role="judge" title="Assigned Projects" breadcrumbs={[{ label: "Judge" }, { label: "Projects" }]}>
        <Card className="p-4">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Released to Judges">Pending</TabsTrigger>
              <TabsTrigger value="Judging in Progress">In progress</TabsTrigger>
              <TabsTrigger value="Judged">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>
        <Card className="mt-6 p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Team</TableHead><TableHead>Track</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={5} className="text-sm text-muted-foreground">Loading projects…</TableCell></TableRow> : null}
              {items.map(s => (
                <TableRow key={s.submissionId}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell>{s.teamName}</TableCell>
                  <TableCell className="text-muted-foreground">{s.trackName}</TableCell>
                  <TableCell><StatusBadge status={s.submissionStatus} /></TableCell>
                  <TableCell><Button asChild size="sm" variant="outline"><Link to="/judge/projects/$submissionId" params={{ submissionId: s.submissionId }}>Evaluate</Link></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </AppShell>
    );
  },
});
