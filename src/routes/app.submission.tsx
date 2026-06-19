import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Eye, Send } from "lucide-react";
import { SAMPLE_SUBMISSION, TRACKS } from "@/lib/mock-data";

export const Route = createFileRoute("/app/submission")({
  head: () => ({ meta: [{ title: "Submission Builder — KAFD" }] }),
  component: SubmissionBuilder,
});

function SubmissionBuilder() {
  const nav = useNavigate();
  const [data, setData] = useState({ ...SAMPLE_SUBMISSION });
  const upd = (k: keyof typeof data, v: string) => setData((d) => ({ ...d, [k]: v }));

  return (
    <AppShell
      role="team_lead"
      title="Submission Builder"
      breadcrumbs={[{ label: "Team Lead" }, { label: "Submission" }]}
      actions={
        <div className="hidden gap-2 sm:flex">
          <Button variant="outline" size="sm" onClick={() => toast.success("Draft saved")}><Save className="size-4" />Save</Button>
          <Button asChild variant="outline" size="sm"><Link to="/app/submission/preview"><Eye className="size-4" />Preview</Link></Button>
        </div>
      }
    >
      <div className="grid gap-6">
        <Card className="p-6">
          <h3 className="font-display font-semibold">Project overview</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Project title"><Input value={data.title} onChange={(e) => upd("title", e.target.value)} /></Field>
            <Field label="Track">
              <select value={data.track} onChange={(e) => upd("track", e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {TRACKS.map(t => <option key={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Short summary"><Textarea value={data.summary} onChange={(e) => upd("summary", e.target.value)} rows={2} /></Field>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold">Problem · Solution · Impact</h3>
          <div className="mt-5 grid gap-5">
            <Field label="Problem"><Textarea value={data.problem} onChange={(e) => upd("problem", e.target.value)} rows={4} /></Field>
            <Field label="Solution"><Textarea value={data.solution} onChange={(e) => upd("solution", e.target.value)} rows={4} /></Field>
            <Field label="Impact"><Textarea value={data.impact} onChange={(e) => upd("impact", e.target.value)} rows={3} /></Field>
            <Field label="Technical description"><Textarea value={data.technical} onChange={(e) => upd("technical", e.target.value)} rows={4} /></Field>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold">Links</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Demo URL"><Input value={data.demoUrl} onChange={(e) => upd("demoUrl", e.target.value)} /></Field>
            <Field label="Deck URL"><Input value={data.deckUrl} onChange={(e) => upd("deckUrl", e.target.value)} /></Field>
            <Field label="GitHub URL"><Input value={data.githubUrl} onChange={(e) => upd("githubUrl", e.target.value)} /></Field>
            <Field label="Video URL"><Input value={data.videoUrl} onChange={(e) => upd("videoUrl", e.target.value)} /></Field>
          </div>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => toast.success("Draft saved")}><Save className="size-4" />Save draft</Button>
          <Button asChild variant="outline"><Link to="/app/submission/preview"><Eye className="size-4" />Preview</Link></Button>
          <Button variant="kafd" onClick={() => { toast.success("Submitted for mentor review"); nav({ to: "/app/submission/confirmation" }); }}>
            <Send className="size-4" />Submit for Mentor Review
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
