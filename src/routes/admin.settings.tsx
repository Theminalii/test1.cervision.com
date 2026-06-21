import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { apiPut, useApiQuery } from "@/lib/api-client";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin — KAFD" }] }),
  component: () => {
    const { data, isLoading } = useApiQuery<any>(["admin-settings"], "/api/admin/settings");
    const [allowEdits, setAllowEdits] = useState(false);
    const [form, setForm] = useState({
      registrationDeadline: "",
      submissionDeadline: "",
      mentorReviewDeadline: "",
      judgingDeadline: "",
      maxTeamSize: 5,
      platformStatus: "registration_open",
    });
    useEffect(() => {
      if (!data) return;
      setAllowEdits(Boolean(data.allowSubmissionEdits));
      setForm({
        registrationDeadline: data.registrationDeadline?.slice(0, 16) ?? "",
        submissionDeadline: data.submissionDeadline?.slice(0, 16) ?? "",
        mentorReviewDeadline: data.mentorReviewDeadline?.slice(0, 16) ?? "",
        judgingDeadline: data.judgingDeadline?.slice(0, 16) ?? "",
        maxTeamSize: data.maxTeamSize ?? 5,
        platformStatus: data.platformStatus ?? "registration_open",
      });
    }, [data]);
    return (
      <AppShell role="admin" title="Platform Settings" breadcrumbs={[{ label: "Admin" }, { label: "Settings" }]}>
        {isLoading ? (
          <Card className="p-6 text-sm text-muted-foreground">Loading settings…</Card>
        ) : (
        <>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="font-display font-semibold">Deadlines</h3>
            <div className="mt-5 grid gap-4">
              <Field label="Registration deadline"><Input type="datetime-local" value={form.registrationDeadline} onChange={(e) => setForm((f) => ({ ...f, registrationDeadline: e.target.value }))} /></Field>
              <Field label="Submission deadline"><Input type="datetime-local" value={form.submissionDeadline} onChange={(e) => setForm((f) => ({ ...f, submissionDeadline: e.target.value }))} /></Field>
              <Field label="Mentor review deadline"><Input type="datetime-local" value={form.mentorReviewDeadline} onChange={(e) => setForm((f) => ({ ...f, mentorReviewDeadline: e.target.value }))} /></Field>
              <Field label="Judging deadline"><Input type="datetime-local" value={form.judgingDeadline} onChange={(e) => setForm((f) => ({ ...f, judgingDeadline: e.target.value }))} /></Field>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-display font-semibold">Program rules</h3>
            <div className="mt-5 grid gap-4">
              <Field label="Maximum team size"><Input type="number" value={form.maxTeamSize} onChange={(e) => setForm((f) => ({ ...f, maxTeamSize: Number(e.target.value) }))} /></Field>
              <div className="flex items-center justify-between rounded-md border border-border p-4">
                <div>
                  <div className="font-medium">Allow submission edits after submit</div>
                  <div className="text-xs text-muted-foreground">When off, only clarification round allows edits.</div>
                </div>
                <Switch checked={allowEdits} onCheckedChange={setAllowEdits} />
              </div>
              <Field label="Platform status">
                <select value={form.platformStatus} onChange={(e) => setForm((f) => ({ ...f, platformStatus: e.target.value }))} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="registration_open">Open — accepting registrations</option>
                  <option value="submission_open">Live — hackathon in progress</option>
                  <option value="judging_live">Judging</option>
                  <option value="closed">Closed — winners announced</option>
                </select>
              </Field>
            </div>
          </Card>
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="kafd" onClick={async () => {
            try {
              await apiPut("/api/admin/settings", {
                registration_deadline: new Date(form.registrationDeadline).toISOString(),
                submission_deadline: new Date(form.submissionDeadline).toISOString(),
                mentor_review_deadline: new Date(form.mentorReviewDeadline).toISOString(),
                judging_deadline: new Date(form.judgingDeadline).toISOString(),
                max_team_size: form.maxTeamSize,
                allow_submission_edits: allowEdits,
                platform_status: form.platformStatus,
              });
              toast.success("Settings saved");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Save failed");
            }
          }}>Save changes</Button>
        </div>
        </>
        )}
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
