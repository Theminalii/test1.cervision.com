import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MENTORS, SUBMISSIONS } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/mentor-assignments")({
  head: () => ({ meta: [{ title: "Mentor Assignments — KAFD" }] }),
  component: () => {
    const [mentor, setMentor] = useState(MENTORS[0].id);
    const [sub, setSub] = useState(SUBMISSIONS[0].id);
    return (
      <AppShell role="admin" title="Mentor Assignments" breadcrumbs={[{ label: "Admin" }, { label: "Mentor Assignments" }]}>
        <Card className="p-6">
          <h3 className="font-display font-semibold">New assignment</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <Select label="Mentor" value={mentor} onChange={setMentor} options={MENTORS.map(m => ({ v: m.id, l: `${m.name} — ${m.expertise}` }))} />
            <Select label="Submission" value={sub} onChange={setSub} options={SUBMISSIONS.map(s => ({ v: s.id, l: `${s.title}` }))} />
            <div className="flex items-end"><Button variant="kafd" onClick={() => toast.success("Assigned")}>Assign</Button></div>
          </div>
        </Card>
        <Card className="mt-6 p-0">
          <div className="border-b border-border p-5"><h3 className="font-display font-semibold">Current assignments</h3></div>
          <Table>
            <TableHeader><TableRow><TableHead>Submission</TableHead><TableHead>Team</TableHead><TableHead>Mentor</TableHead></TableRow></TableHeader>
            <TableBody>
              {SUBMISSIONS.slice(0, 12).map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell>{s.team}</TableCell>
                  <TableCell className="text-muted-foreground">{s.mentor}</TableCell>
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
