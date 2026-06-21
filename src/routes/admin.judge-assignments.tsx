import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiPost, useApiQuery } from "@/lib/api-client";

export const Route = createFileRoute("/admin/judge-assignments")({
  head: () => ({ meta: [{ title: "Judge Assignments — KAFD" }] }),
  component: () => {
    const queryClient = useQueryClient();
    const { data: judges = [] } = useApiQuery<Array<any>>(["admin-judges"], "/api/admin/judges");
    const { data: submissions = [] } = useApiQuery<Array<any>>(["admin-submissions"], "/api/admin/submissions");
    const approved = submissions.filter(s => ["Approved for Judging", "Released to Judges", "Judging in Progress", "Judged"].includes(s.status));
    const [judge, setJudge] = useState("");
    const [sub, setSub] = useState("");
    return (
      <AppShell role="admin" title="Judge Assignments" breadcrumbs={[{ label: "Admin" }, { label: "Judge Assignments" }]}>
        <Card className="p-6">
          <h3 className="font-display font-semibold">New assignment</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Judge</div>
              <select value={judge} onChange={(e) => setJudge(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {judges.map(j => <option key={j.id} value={j.id}>{j.fullName} — {j.organization}</option>)}
              </select>
            </div>
            <div>
              <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Submission (approved)</div>
              <select value={sub} onChange={(e) => setSub(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {approved.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            <div className="flex items-end"><Button variant="kafd" onClick={async () => { try { await apiPost("/api/admin/judge-assignments", { judge_id: judge, submission_id: sub }); toast.success("Assigned to judge"); await queryClient.invalidateQueries({ queryKey: ["admin-submissions"] }); } catch (error) { toast.error(error instanceof Error ? error.message : "Assign failed"); } }}>Assign</Button></div>
          </div>
        </Card>
        <Card className="mt-6 p-0">
          <div className="border-b border-border p-5"><h3 className="font-display font-semibold">Active assignments</h3></div>
          <Table>
            <TableHeader><TableRow><TableHead>Submission</TableHead><TableHead>Team</TableHead><TableHead>Judge</TableHead></TableRow></TableHeader>
            <TableBody>
              {approved.slice(0, 12).map((s, i) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell>{s.teamName}</TableCell>
                  <TableCell className="text-muted-foreground">{judges[i % Math.max(judges.length, 1)]?.fullName ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </AppShell>
    );
  },
});
