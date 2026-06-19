import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Bell } from "lucide-react";
import { ANNOUNCEMENTS, TIMELINE } from "@/lib/mock-data";

export const Route = createFileRoute("/member/dashboard")({
  head: () => ({ meta: [{ title: "Member Dashboard — KAFD" }] }),
  component: MemberDashboard,
});

function MemberDashboard() {
  return (
    <AppShell role="team_member" title="Your team" breadcrumbs={[{ label: "Team Member" }, { label: "Dashboard" }]}>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Team</div>
          <h2 className="mt-1 font-display text-2xl font-bold">Atlas Capital</h2>
          <p className="mt-2 text-sm text-muted-foreground">Track: FinTech · Led by Sara Al-Otaibi · 4 members</p>
          <div className="mt-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Submission</div>
            <div className="mt-2"><StatusBadge status="Submitted for Review" label="Under Mentor Review" /></div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold">Key dates</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {TIMELINE.slice(2, 6).map((t) => (
              <li key={t.id} className="flex justify-between border-b border-border pb-2 last:border-0">
                <span>{t.label}</span><span className="text-muted-foreground">{t.date}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 lg:col-span-3">
          <div className="flex items-center gap-2"><Bell className="size-4 text-gold-foreground" /><h3 className="font-display font-semibold">Announcements</h3></div>
          <div className="mt-4 space-y-3">
            {ANNOUNCEMENTS.map((a) => (
              <div key={a.id} className="rounded-md border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.date}</div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
