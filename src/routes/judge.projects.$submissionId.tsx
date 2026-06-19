import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { RUBRIC, SAMPLE_SUBMISSION, SUBMISSIONS } from "@/lib/mock-data";

export const Route = createFileRoute("/judge/projects/$submissionId")({
  head: () => ({ meta: [{ title: "Evaluate Submission — KAFD" }] }),
  component: JudgeDetail,
});

function JudgeDetail() {
  const { submissionId } = Route.useParams();
  const nav = useNavigate();
  const sub = SUBMISSIONS.find(s => s.id === submissionId) ?? SUBMISSIONS[0];
  const [scores, setScores] = useState<Record<string, number>>(Object.fromEntries(RUBRIC.map(r => [r.id, 3])));
  const [comments, setComments] = useState("");

  const weighted = useMemo(() => {
    const total = RUBRIC.reduce((acc, r) => acc + (scores[r.id] / 5) * r.weight, 0);
    return Math.round(total);
  }, [scores]);

  return (
    <AppShell role="judge" title={sub.title} breadcrumbs={[{ label: "Judge" }, { label: "Projects", to: "/judge/projects" }, { label: sub.id }]}>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="overflow-hidden p-0">
          <div className="kafd-gradient p-6 text-primary-foreground">
            <div className="text-xs uppercase tracking-widest text-gold">{sub.track} · {sub.team}</div>
            <h2 className="mt-2 font-display text-xl font-bold">{sub.title}</h2>
            <p className="mt-2 text-primary-foreground/85">{SAMPLE_SUBMISSION.summary}</p>
          </div>
          <div className="grid gap-6 p-6 sm:grid-cols-2">
            {[["Problem", SAMPLE_SUBMISSION.problem], ["Solution", SAMPLE_SUBMISSION.solution], ["Impact", SAMPLE_SUBMISSION.impact], ["Technical", SAMPLE_SUBMISSION.technical]].map(([k, v]) => (
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
          <Button variant="kafd" className="mt-5 w-full" onClick={() => { toast.success("Evaluation submitted"); nav({ to: "/judge/projects" }); }}>
            Submit Evaluation
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
