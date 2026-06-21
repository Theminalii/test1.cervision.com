import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, ExternalLink } from "lucide-react";
import { apiPost, useApiQuery } from "@/lib/api-client";

export const Route = createFileRoute("/app/submission/preview")({
  head: () => ({ meta: [{ title: "Submission Preview — KAFD" }] }),
  component: PreviewPage,
});

function PreviewPage() {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const { data: d, isLoading } = useApiQuery<any | null>(["my-submission"], "/api/submissions/my");
  return (
    <AppShell role="team_lead" title="Submission Preview" breadcrumbs={[{ label: "Team Lead" }, { label: "Submission", to: "/app/submission" }, { label: "Preview" }]}>
      {isLoading || !d ? (
        <Card className="p-6 text-sm text-muted-foreground">Loading preview…</Card>
      ) : (
      <div className="mx-auto max-w-4xl">
        <Card className="overflow-hidden p-0">
          <div className="kafd-gradient p-8 text-primary-foreground">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-gold">
              <span>{d.track_name}</span>
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold">{d.title}</h2>
            <p className="mt-3 max-w-2xl text-primary-foreground/85">{d.short_summary}</p>
          </div>
          <div className="space-y-8 p-8">
            <Section title="Problem">{d.problem}</Section>
            <Section title="Solution">{d.solution}</Section>
            <Section title="Impact">{d.impact}</Section>
            <Section title="Technical">{d.technical_description}</Section>
            <div>
              <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">Links</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {d.demo_url ? <LinkRow label="Demo" url={d.demo_url} /> : null}
                {d.deck_url ? <LinkRow label="Deck" url={d.deck_url} /> : null}
                {d.github_url ? <LinkRow label="GitHub" url={d.github_url} /> : null}
                {d.video_url ? <LinkRow label="Video" url={d.video_url} /> : null}
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="outline"><Link to="/app/submission"><ArrowLeft className="size-4" />Back to builder</Link></Button>
          <Button variant="kafd" onClick={async () => {
            try {
              await apiPost(`/api/submissions/${d.id}/submit-for-review`, {});
              await queryClient.invalidateQueries({ queryKey: ["my-submission"] });
              toast.success("Submitted for mentor review");
              nav({ to: "/app/submission/confirmation" });
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Submit failed");
            }
          }}>
            <Send className="size-4" />Submit for Mentor Review
          </Button>
        </div>
      </div>
      )}
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-foreground">{children}</p>
    </div>
  );
}
function LinkRow({ label, url }: { label: string; url: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-4 py-3 text-sm">
      <Badge variant="outline" className="border-gold/30 bg-gold/10 text-gold-foreground">{label}</Badge>
      <a className="flex items-center gap-1 truncate font-medium text-primary" href={url} target="_blank" rel="noreferrer">
        <span className="truncate">{url.replace(/^https?:\/\//, "")}</span><ExternalLink className="size-3.5" />
      </a>
    </div>
  );
}
