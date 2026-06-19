import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus } from "lucide-react";
import { MENTORS } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/mentors")({
  head: () => ({ meta: [{ title: "Mentors — Admin — KAFD" }] }),
  component: () => (
    <AppShell role="admin" title="Mentors" breadcrumbs={[{ label: "Admin" }, { label: "Mentors" }]}
      actions={<Button size="sm" variant="kafd" onClick={() => toast.success("Invitation sent")}><UserPlus className="size-4" />Invite mentor</Button>}>
      <Card className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Mentor</TableHead><TableHead>Expertise</TableHead><TableHead>Assigned</TableHead><TableHead>Completed</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {MENTORS.map(m => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell className="text-muted-foreground">{m.expertise}</TableCell>
                <TableCell>{m.assigned}</TableCell>
                <TableCell>{m.completed}</TableCell>
                <TableCell><Badge variant="outline" className={m.active ? "border-success/30 bg-success/10 text-success" : "border-muted-foreground/30 text-muted-foreground"}>{m.active ? "Active" : "Inactive"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  ),
});
