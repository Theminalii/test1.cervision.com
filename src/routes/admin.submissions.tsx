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
import { apiPost, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/admin/submissions")({
  head: () => ({ meta: [{ title: "Submissions — Admin — KAFD" }] }),
  component: () => {
    const [filter, setFilter] = useState("all");
    const queryClient = useQueryClient();
    const { data: items = [], isLoading } = useApiQuery<Array<any>>(["admin-submissions"], "/api/admin/submissions");
    const { data: mentors = [] } = useApiQuery<Array<any>>(["admin-mentors"], "/api/admin/mentors");
    const filtered = items.filter(s => filter === "all" || s.status === filter);
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
              {isLoading ? <TableRow><TableCell colSpan={5} className="text-sm text-muted-foreground">Loading submissions…</TableCell></TableRow> : null}
              {filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell>{s.teamName}</TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell className="text-muted-foreground">Assigned via mentor assignments</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <AssignMentorDialog
                        title={s.title}
                        mentors={mentors}
                        onAssign={async (mentorId) => {
                          await apiPost("/api/admin/mentor-assignments", { mentor_id: mentorId, submission_id: s.id });
                          toast.success("Mentor assigned");
                          await queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
                        }}
                      >
                        <Button size="sm" variant="outline">Assign mentor</Button>
                      </AssignMentorDialog>
                      <Button size="sm" variant="kafd" onClick={async () => { try { await apiPost(`/api/admin/submissions/${s.id}/release-to-judges`, {}); toast.success("Released to judges"); await queryClient.invalidateQueries({ queryKey: ["admin-submissions"] }); } catch (error) { toast.error(error instanceof Error ? error.message : "Release failed"); } }}>Release</Button>
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

function AssignMentorDialog({ title, children, mentors, onAssign }: { title: string; children: React.ReactNode; mentors: any[]; onAssign: (mentorId: string) => Promise<void> }) {
  const [mentor, setMentor] = useState(mentors[0]?.id ?? "");
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Assign mentor</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">Assign a mentor to <span className="font-medium text-foreground">{title}</span>.</p>
        <select value={mentor} onChange={(e) => setMentor(e.target.value)} className="mt-3 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
          {mentors.map(m => <option key={m.id} value={m.id}>{m.fullName} — {m.organization}</option>)}
        </select>
        <DialogFooter>
          <Button variant="kafd" onClick={() => onAssign(mentor)}>Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
