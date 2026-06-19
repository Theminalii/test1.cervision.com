import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin — KAFD" }] }),
  component: () => {
    const [allowEdits, setAllowEdits] = useState(false);
    return (
      <AppShell role="admin" title="Platform Settings" breadcrumbs={[{ label: "Admin" }, { label: "Settings" }]}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="font-display font-semibold">Deadlines</h3>
            <div className="mt-5 grid gap-4">
              <Field label="Registration deadline"><Input type="datetime-local" defaultValue="2026-10-20T18:00" /></Field>
              <Field label="Submission deadline"><Input type="datetime-local" defaultValue="2026-10-28T23:59" /></Field>
              <Field label="Mentor review deadline"><Input type="datetime-local" defaultValue="2026-11-01T18:00" /></Field>
              <Field label="Judging deadline"><Input type="datetime-local" defaultValue="2026-11-05T23:59" /></Field>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-display font-semibold">Program rules</h3>
            <div className="mt-5 grid gap-4">
              <Field label="Maximum team size"><Input type="number" defaultValue={5} /></Field>
              <div className="flex items-center justify-between rounded-md border border-border p-4">
                <div>
                  <div className="font-medium">Allow submission edits after submit</div>
                  <div className="text-xs text-muted-foreground">When off, only clarification round allows edits.</div>
                </div>
                <Switch checked={allowEdits} onCheckedChange={setAllowEdits} />
              </div>
              <Field label="Platform status">
                <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option>Open — accepting registrations</option>
                  <option>Live — hackathon in progress</option>
                  <option>Judging</option>
                  <option>Closed — winners announced</option>
                </select>
              </Field>
            </div>
          </Card>
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="kafd" onClick={() => toast.success("Settings saved")}>Save changes</Button>
        </div>
      </AppShell>
    );
  },
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
