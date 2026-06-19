import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";

const EXPORTS = [
  { label: "Participants", rows: 120, key: "participants" },
  { label: "Teams", rows: 34, key: "teams" },
  { label: "Submissions", rows: 28, key: "submissions" },
  { label: "Scores", rows: 84, key: "scores" },
  { label: "Winners", rows: 3, key: "winners" },
];

export const Route = createFileRoute("/admin/exports")({
  head: () => ({ meta: [{ title: "Exports — Admin — KAFD" }] }),
  component: () => (
    <AppShell role="admin" title="Exports" breadcrumbs={[{ label: "Admin" }, { label: "Exports" }]}>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {EXPORTS.map(e => (
          <Card key={e.key} className="p-6">
            <div className="grid size-10 place-items-center rounded-lg bg-primary/8 text-primary"><FileSpreadsheet className="size-5" /></div>
            <h3 className="mt-4 font-display text-lg font-semibold">{e.label} CSV</h3>
            <p className="mt-1 text-sm text-muted-foreground">{e.rows} rows · UTF-8 · comma-separated</p>
            <Button variant="outline" className="mt-4 w-full" onClick={() => toast.success(`${e.label} export started`)}>
              <Download className="size-4" />Download
            </Button>
          </Card>
        ))}
      </div>
    </AppShell>
  ),
});
