import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus } from "lucide-react";
import { JUDGES } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/judges")({
  head: () => ({ meta: [{ title: "Judges — Admin — KAFD" }] }),
  component: () => (
    <AppShell role="admin" title="Judges" breadcrumbs={[{ label: "Admin" }, { label: "Judges" }]}
      actions={<Button size="sm" variant="kafd" onClick={() => toast.success("Invitation sent")}><UserPlus className="size-4" />Invite judge</Button>}>
      <Card className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Judge</TableHead><TableHead>Organization</TableHead><TableHead>Assigned</TableHead><TableHead>Completed</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {JUDGES.map(j => (
              <TableRow key={j.id}>
                <TableCell className="font-medium">{j.name}</TableCell>
                <TableCell className="text-muted-foreground">{j.org}</TableCell>
                <TableCell>{j.assigned}</TableCell>
                <TableCell>{j.completed}</TableCell>
                <TableCell><Badge variant="outline" className={j.active ? "border-success/30 bg-success/10 text-success" : "border-muted-foreground/30 text-muted-foreground"}>{j.active ? "Active" : "Inactive"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  ),
});
