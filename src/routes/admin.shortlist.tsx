import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { SUBMISSIONS } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/shortlist")({
  head: () => ({ meta: [{ title: "Shortlist — Admin — KAFD" }] }),
  component: () => {
    const [shortlist, setShortlist] = useState<Record<string, boolean>>({ "S-300": true, "S-301": true, "S-302": true, "S-303": true, "S-304": true });
    const toggle = (id: string) => setShortlist(s => { const next = { ...s, [id]: !s[id] }; toast.success(next[id] ? "Shortlisted" : "Removed from shortlist"); return next; });
    return (
      <AppShell role="admin" title="Shortlist" breadcrumbs={[{ label: "Admin" }, { label: "Shortlist" }]}>
        <div className="grid gap-4">
          {SUBMISSIONS.slice(0, 12).map((s, i) => {
            const isOn = !!shortlist[s.id];
            return (
              <Card key={s.id} className={`flex flex-wrap items-center justify-between gap-4 p-5 ${isOn ? "border-gold/40 bg-gradient-to-r from-gold/8 to-transparent" : ""}`}>
                <div className="flex items-center gap-4">
                  <div className={`grid size-10 place-items-center rounded-lg ${isOn ? "bg-gold/20 text-gold-foreground" : "bg-muted text-muted-foreground"}`}><Star className="size-5" /></div>
                  <div>
                    <div className="font-display font-semibold">{s.title}</div>
                    <div className="text-xs text-muted-foreground">{s.team} · Score {78 + (i * 3) % 18}</div>
                  </div>
                </div>
                <Button variant={isOn ? "gold" : "outline"} size="sm" onClick={() => toggle(s.id)}>{isOn ? "Shortlisted" : "Mark as shortlisted"}</Button>
              </Card>
            );
          })}
        </div>
      </AppShell>
    );
  },
});
