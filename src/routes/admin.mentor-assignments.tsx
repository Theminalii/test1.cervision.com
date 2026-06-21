import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiPost, useApiQuery } from "@/lib/api-client";

export const Route = createFileRoute("/admin/mentor-assignments")({
  head: () => ({ meta: [{ title: "Mentor Assignments — KAFD" }] }),
  component: () => {
    const queryClient = useQueryClient();
    const { data: mentors = [] } = useApiQuery<Array<any>>(["admin-mentors"], "/api/admin/mentors");
    const { data: submissions = [] } = useApiQuery<Array<any>>(["admin-submissions"], "/api/admin/submissions");
    const [mentor, setMentor] = useState("");
    const [sub, setSub] = useState("");
    return (
      <AppShell role="admin" title="Mentor Assignments" breadcrumbs={[{ label: "Admin" }, { label: "Mentor Assignments" }]}>
        <Card className="p-6">
          <h3 className="font-display font-semibold">New assignment</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <Select label="Mentor" value={mentor} onChange={setMentor} options={mentors.map(m => ({ v: m.id, l: `${m.fullName} — ${m.organization}` }))} />
            <Select label="Submission" value={sub} onChange={setSub} options={submissions.map(s => ({ v: s.id, l: `${s.title}` }))} />
            <div className="flex items-end"><Button variant="kafd" onClick={async () => { try { await apiPost("/api/admin/mentor-assignments", { mentor_id: mentor, submission_id: sub }); toast.success("Assigned"); await queryClient.invalidateQueries({ queryKey: ["admin-submissions"] }); } catch (error) { toast.error(error instanceof Error ? error.message : "Assign failed"); } }}>Assign</Button></div>
          </div>
        </Card>
        <Card className="mt-6 p-0">
          <div className="border-b border-border p-5"><h3 className="font-display font-semibold">Current assignments</h3></div>
          <Table>
            <TableHeader><TableRow><TableHead>Submission</TableHead><TableHead>Team</TableHead><TableHead>Mentor</TableHead></TableRow></TableHeader>
            <TableBody>
              {submissions.slice(0, 12).map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell>{s.teamName}</TableCell>
                  <TableCell className="text-muted-foreground">See submission detail</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </AppShell>
    );
  },
});

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}
