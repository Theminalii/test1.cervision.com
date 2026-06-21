import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Eye, Send } from "lucide-react";
import { apiPost, apiPut, useApiQuery } from "@/lib/api-client";

export const Route = createFileRoute("/app/submission")({
  head: () => ({ meta: [{ title: "Submission Builder — KAFD" }] }),
  component: SubmissionBuilder,
});

function SubmissionBuilder() {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const { data: submission, isLoading } = useApiQuery<any | null>(["my-submission"], "/api/submissions/my");
  const { data: team } = useApiQuery<any | null>(["my-team"], "/api/teams/my");
  const [data, setData] = useState({
    title: "",
    shortSummary: "",
    trackId: "",
    problem: "",
    solution: "",
    impact: "",
    technicalDescription: "",
    demoUrl: "",
    deckUrl: "",
    githubUrl: "",
    videoUrl: "",
  });
  useEffect(() => {
    if (submission) {
      setData({
        title: submission.title ?? "",
        shortSummary: submission.short_summary ?? "",
        trackId: submission.track_id ?? "",
        problem: submission.problem ?? "",
        solution: submission.solution ?? "",
        impact: submission.impact ?? "",
        technicalDescription: submission.technical_description ?? "",
        demoUrl: submission.demo_url ?? "",
        deckUrl: submission.deck_url ?? "",
        githubUrl: submission.github_url ?? "",
        videoUrl: submission.video_url ?? "",
      });
    } else if (team?.track_id) {
      setData((current) => ({ ...current, trackId: team.track_id }));
    }
  }, [submission, team?.track_id]);
  const upd = (k: keyof typeof data, v: string) => setData((d) => ({ ...d, [k]: v }));

  const saveDraft = async () => {
    const payload = {
      title: data.title,
      short_summary: data.shortSummary,
      track_id: data.trackId,
      problem: data.problem,
      solution: data.solution,
      impact: data.impact,
      technical_description: data.technicalDescription,
      demo_url: data.demoUrl || undefined,
      deck_url: data.deckUrl || undefined,
      github_url: data.githubUrl || undefined,
      video_url: data.videoUrl || undefined,
    };
    if (submission?.id) {
      const updated = await apiPut<any>(`/api/submissions/${submission.id}`, payload);
      await queryClient.invalidateQueries({ queryKey: ["my-submission"] });
      return updated;
    } else {
      const created = await apiPost<any>("/api/submissions", payload);
      await queryClient.invalidateQueries({ queryKey: ["my-submission"] });
      return created;
    }
  };

  const locked = submission && !["Draft", "Needs Clarification"].includes(submission.status);

  return (
    <AppShell
      role="team_lead"
      title="Submission Builder"
      breadcrumbs={[{ label: "Team Lead" }, { label: "Submission" }]}
      actions={
        <div className="hidden gap-2 sm:flex">
          <Button variant="outline" size="sm" onClick={async () => { try { await saveDraft(); toast.success("Draft saved"); } catch (error) { toast.error(error instanceof Error ? error.message : "Save failed"); } }}><Save className="size-4" />Save</Button>
          <Button asChild variant="outline" size="sm"><Link to="/app/submission/preview"><Eye className="size-4" />Preview</Link></Button>
        </div>
      }
    >
      {isLoading ? (
        <Card className="p-6 text-sm text-muted-foreground">Loading submission…</Card>
      ) : (
      <div className="grid gap-6">
        <Card className="p-6">
          <h3 className="font-display font-semibold">Project overview</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Project title"><Input disabled={locked} value={data.title} onChange={(e) => upd("title", e.target.value)} /></Field>
            <Field label="Track">
              <select disabled={locked} value={data.trackId} onChange={(e) => upd("trackId", e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">{team?.track_name ?? "Select a track"}</option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Short summary"><Textarea disabled={locked} value={data.shortSummary} onChange={(e) => upd("shortSummary", e.target.value)} rows={2} /></Field>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold">Problem · Solution · Impact</h3>
          <div className="mt-5 grid gap-5">
            <Field label="Problem"><Textarea disabled={locked} value={data.problem} onChange={(e) => upd("problem", e.target.value)} rows={4} /></Field>
            <Field label="Solution"><Textarea disabled={locked} value={data.solution} onChange={(e) => upd("solution", e.target.value)} rows={4} /></Field>
            <Field label="Impact"><Textarea disabled={locked} value={data.impact} onChange={(e) => upd("impact", e.target.value)} rows={3} /></Field>
            <Field label="Technical description"><Textarea disabled={locked} value={data.technicalDescription} onChange={(e) => upd("technicalDescription", e.target.value)} rows={4} /></Field>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold">Links</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Demo URL"><Input disabled={locked} value={data.demoUrl} onChange={(e) => upd("demoUrl", e.target.value)} /></Field>
            <Field label="Deck URL"><Input disabled={locked} value={data.deckUrl} onChange={(e) => upd("deckUrl", e.target.value)} /></Field>
            <Field label="GitHub URL"><Input disabled={locked} value={data.githubUrl} onChange={(e) => upd("githubUrl", e.target.value)} /></Field>
            <Field label="Video URL"><Input disabled={locked} value={data.videoUrl} onChange={(e) => upd("videoUrl", e.target.value)} /></Field>
          </div>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" disabled={locked} onClick={async () => { try { await saveDraft(); toast.success("Draft saved"); } catch (error) { toast.error(error instanceof Error ? error.message : "Save failed"); } }}><Save className="size-4" />Save draft</Button>
          <Button asChild variant="outline"><Link to="/app/submission/preview"><Eye className="size-4" />Preview</Link></Button>
          <Button disabled={locked} variant="kafd" onClick={async () => { try { const saved = await saveDraft(); await apiPost(`/api/submissions/${saved.id}/submit-for-review`, {}); await queryClient.invalidateQueries({ queryKey: ["my-submission"] }); toast.success("Submitted for mentor review"); nav({ to: "/app/submission/confirmation" }); } catch (error) { toast.error(error instanceof Error ? error.message : "Submit failed"); } }}>
            <Send className="size-4" />Submit for Mentor Review
          </Button>
        </div>
      </div>
      )}
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
