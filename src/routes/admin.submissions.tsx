import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SUBMISSIONS, MENTORS } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/submissions")({
  head: () => ({ meta: [{ title: "Submissions — Admin — KAFD" }] }),
  component: () => {
    const [filter, setFilter] = useState("all");
    const items = SUBMISSIONS.filter(s => filter === "all" || s.status === filter);
    return (
      <AppShell role="admin" title="Submissions" breadcrumbs={[{ label: "Admin" }, { label: "Submissions" }]}>
        <Card className="p-4">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Submitted for Review">Submitted</TabsTrigger>
              <TabsTrigger value="Approved for Judging">Approved</TabsTrigger>
              <TabsTrigger value="Released to Judges">Released</TabsTrigger>
              <TabsTrigger value="Judged">Judged</TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>
        <Card className="mt-6 p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Team</TableHead><TableHead>Status</TableHead><TableHead>Mentor</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {items.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell>{s.team}</TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{s.mentor}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <AssignMentorDialog title={s.title}>
                        <Button size="sm" variant="outline">Assign mentor</Button>
                      </AssignMentorDialog>
                      <Button size="sm" variant="kafd" onClick={() => toast.success("Released to judges")}>Release</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </AppShell>
    );
  },
});

function AssignMentorDialog({ title, children }: { title: string; children: React.ReactNode }) {
  const [mentor, setMentor] = useState(MENTORS[0].id);
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Assign mentor</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">Assign a mentor to <span className="font-medium text-foreground">{title}</span>.</p>
        <select value={mentor} onChange={(e) => setMentor(e.target.value)} className="mt-3 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
          {MENTORS.map(m => <option key={m.id} value={m.id}>{m.name} — {m.expertise}</option>)}
        </select>
        <DialogFooter>
          <Button variant="kafd" onClick={() => toast.success("Mentor assigned")}>Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
