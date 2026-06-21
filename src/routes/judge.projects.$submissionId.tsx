import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { RUBRIC } from "@/lib/mock-data";
import { apiPost, useApiQuery } from "@/lib/api-client";

export const Route = createFileRoute("/judge/projects/$submissionId")({
  head: () => ({ meta: [{ title: "Evaluate Submission — KAFD" }] }),
  component: JudgeDetail,
});

function JudgeDetail() {
  const { submissionId } = Route.useParams();
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const { data: sub, isLoading } = useApiQuery<any>(["judge-project", submissionId], `/api/judge/projects/${submissionId}`);
  const [scores, setScores] = useState<Record<string, number>>(Object.fromEntries(RUBRIC.map(r => [r.id, 3])));
  const [comments, setComments] = useState("");

  const weighted = useMemo(() => {
    const total = RUBRIC.reduce((acc, r) => acc + (scores[r.id] / 5) * r.weight, 0);
    return Math.round(total);
  }, [scores]);

  return (
    <AppShell role="judge" title={sub?.title ?? "Evaluate Submission"} breadcrumbs={[{ label: "Judge" }, { label: "Projects", to: "/judge/projects" }, { label: submissionId }]}>
      {isLoading || !sub ? (
        <Card className="p-6 text-sm text-muted-foreground">Loading project…</Card>
      ) : (
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="overflow-hidden p-0">
          <div className="kafd-gradient p-6 text-primary-foreground">
            <div className="text-xs uppercase tracking-widest text-gold">{sub.trackName} · {sub.teamName}</div>
            <h2 className="mt-2 font-display text-xl font-bold">{sub.title}</h2>
            <p className="mt-2 text-primary-foreground/85">{sub.shortSummary}</p>
          </div>
          <div className="grid gap-6 p-6 sm:grid-cols-2">
            {[["Problem", sub.problem], ["Solution", sub.solution], ["Impact", sub.impact], ["Technical", sub.technicalDescription]].map(([k, v]) => (
              <div key={k}><div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{k}</div><p className="mt-2 text-sm">{v}</p></div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold">Scoring rubric</h3>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Weighted score</div>
              <div className="font-display text-3xl font-bold text-primary">{weighted}<span className="text-sm text-muted-foreground">/100</span></div>
            </div>
          </div>
          <div className="mt-6 space-y-5">
            {RUBRIC.map((r) => (
              <div key={r.id}>
                <div className="flex items-center justify-between text-sm">
                  <div><span className="font-medium">{r.label}</span> <span className="text-xs text-muted-foreground">({r.weight}%)</span></div>
                  <div className="font-mono text-sm font-semibold">{scores[r.id]} / 5</div>
                </div>
                <Slider value={[scores[r.id]]} min={1} max={5} step={1} onValueChange={(v) => setScores(s => ({ ...s, [r.id]: v[0] }))} className="mt-2" />
              </div>
            ))}
          </div>
          <div className="mt-6">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Comments</div>
            <Textarea rows={4} className="mt-2" placeholder="Optional reviewer comments…" value={comments} onChange={(e) => setComments(e.target.value)} />
          </div>
          <Button variant="kafd" className="mt-5 w-full" onClick={async () => {
            try {
              await apiPost(`/api/judge/projects/${submissionId}/score`, {
                problem_relevance: scores.problem,
                innovation: scores.innovation,
                execution_prototype: scores.execution,
                impact_scalability: scores.impact,
                presentation_clarity: scores.presentation,
                comments,
              });
              await queryClient.invalidateQueries({ queryKey: ["judge-projects"] });
              toast.success("Evaluation submitted");
              nav({ to: "/judge/projects" });
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Submission failed");
            }
          }}>
            Submit Evaluation
          </Button>
        </Card>
      </div>
      )}
    </AppShell>
  );
}
