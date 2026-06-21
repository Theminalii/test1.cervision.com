import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { useApiQuery } from "@/lib/api-client";

export const Route = createFileRoute("/admin/participants")({
  head: () => ({ meta: [{ title: "Participants — Admin — KAFD" }] }),
  component: () => {
    const [q, setQ] = useState("");
    const { data = [], isLoading } = useApiQuery<Array<any>>(["admin-participants"], "/api/admin/participants");
    const items = data.filter(p => q === "" || p.fullName.toLowerCase().includes(q.toLowerCase()) || p.email.includes(q.toLowerCase())).slice(0, 50);
    return (
      <AppShell role="admin" title="Participants" breadcrumbs={[{ label: "Admin" }, { label: "Participants" }]}>
        <Card className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by name or email…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </Card>
        <Card className="mt-6 p-0">
          <Table>
            <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Team</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={5} className="text-sm text-muted-foreground">Loading participants…</TableCell></TableRow> : null}
              {items.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.id}</TableCell>
                  <TableCell className="font-medium">{p.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{p.email}</TableCell>
                  <TableCell><span className="text-muted-foreground">See team detail</span></TableCell>
                  <TableCell><Badge variant="outline" className={p.status === "active" ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/15 text-warning-foreground"}>{p.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="border-t border-border p-3 text-center text-xs text-muted-foreground">Showing {items.length} of {data.length}</div>
        </Card>
      </AppShell>
    );
  },
});
