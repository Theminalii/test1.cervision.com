import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useApiQuery } from "@/lib/api-client";

export const Route = createFileRoute("/mentor/submissions")({
  head: () => ({ meta: [{ title: "Submissions — Mentor — KAFD" }] }),
  component: MentorSubmissions,
});

function MentorSubmissions() {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useApiQuery<Array<any>>(["mentor-submissions"], "/api/mentor/submissions");
  const filtered = data.filter((s) =>
    (filter === "all" || s.submissionStatus === filter) &&
    (q === "" || s.title.toLowerCase().includes(q.toLowerCase()) || s.teamName.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <AppShell role="mentor" title="Assigned Submissions" breadcrumbs={[{ label: "Mentor" }, { label: "Submissions" }]}>
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search team or project…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Submitted for Review">Pending</TabsTrigger>
              <TabsTrigger value="Needs Clarification">Clarification</TabsTrigger>
              <TabsTrigger value="Approved for Judging">Approved</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      <Card className="mt-6 p-0">
        <Table>
            <TableHeader>
              <TableRow><TableHead>Project</TableHead><TableHead>Team</TableHead><TableHead>Track</TableHead><TableHead>Status</TableHead><TableHead>Updated</TableHead><TableHead></TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={6} className="text-sm text-muted-foreground">Loading submissions…</TableCell></TableRow> : null}
              {filtered.map((s) => (
              <TableRow key={s.submissionId}>
                <TableCell className="font-medium">{s.title}</TableCell>
                <TableCell>{s.teamName}</TableCell>
                <TableCell className="text-muted-foreground">{s.trackName}</TableCell>
                <TableCell><StatusBadge status={s.submissionStatus} /></TableCell>
                <TableCell className="text-muted-foreground">{new Date(s.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell><Button asChild variant="outline" size="sm"><Link to="/mentor/submissions/$submissionId" params={{ submissionId: s.submissionId }}>Open</Link></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  );
}
