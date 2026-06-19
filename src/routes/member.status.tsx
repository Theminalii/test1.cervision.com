import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Timeline } from "@/components/shared/timeline";

export const Route = createFileRoute("/member/status")({
  head: () => ({ meta: [{ title: "Status — KAFD" }] }),
  component: () => (
    <AppShell role="team_member" title="Submission Status" breadcrumbs={[{ label: "Team Member" }, { label: "Status" }]}>
      <Card className="p-6">
        <Timeline items={[
          { label: "Draft", date: "Oct 16", status: "done" },
          { label: "Submitted for Review", date: "Oct 18", status: "done" },
          { label: "Under Mentor Review", date: "Oct 19", status: "active" },
          { label: "Approved for Judging", status: "upcoming" },
          { label: "With Judges", status: "upcoming" },
          { label: "Judging Complete", status: "upcoming" },
        ]} />
      </Card>
    </AppShell>
  ),
});
