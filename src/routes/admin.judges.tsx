import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus } from "lucide-react";
import { apiPost, useApiQuery } from "@/lib/api-client";

export const Route = createFileRoute("/admin/judges")({
  head: () => ({ meta: [{ title: "Judges — Admin — KAFD" }] }),
  component: JudgesPage,
});

function JudgesPage() {
  const { data: judges = [] } = useApiQuery<Array<any>>(["admin-judges"], "/api/admin/judges");
  return (
    <AppShell role="admin" title="Judges" breadcrumbs={[{ label: "Admin" }, { label: "Judges" }]}
      actions={<Button size="sm" variant="kafd" onClick={async () => { try { await apiPost("/api/admin/judges/invite", { full_name: "New Judge", email: `judge.${Date.now()}@kafd.sa`, phone: "+966500000199", organization: "KAFD", title: "Judge", bio: "Invited judge", assigned_tracks: [] }); toast.success("Invitation queued"); } catch (error) { toast.error(error instanceof Error ? error.message : "Invite failed"); } }}><UserPlus className="size-4" />Invite judge</Button>}>
      <Card className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Judge</TableHead><TableHead>Organization</TableHead><TableHead>Assigned</TableHead><TableHead>Completed</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {judges.map(j => (
              <TableRow key={j.id}>
                <TableCell className="font-medium">{j.fullName}</TableCell>
                <TableCell className="text-muted-foreground">{j.organization}</TableCell>
                <TableCell>—</TableCell>
                <TableCell>—</TableCell>
                <TableCell><Badge variant="outline" className={j.active ? "border-success/30 bg-success/10 text-success" : "border-muted-foreground/30 text-muted-foreground"}>{j.active ? "Active" : "Inactive"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  );
}
