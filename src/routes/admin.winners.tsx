import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { SUBMISSIONS } from "@/lib/mock-data";

const CATEGORIES = ["1st Place", "2nd Place", "3rd Place", "Smart City Track", "FinTech Track", "Sustainability Track"];

export const Route = createFileRoute("/admin/winners")({
  head: () => ({ meta: [{ title: "Winners — Admin — KAFD" }] }),
  component: () => {
    const [winners, setWinners] = useState<Record<string, string>>({ "1st Place": "S-300", "2nd Place": "S-301", "3rd Place": "S-302" });
    const set = (cat: string, sid: string) => { setWinners(w => ({ ...w, [cat]: sid })); toast.success(`${cat} winner set`); };
    return (
      <AppShell role="admin" title="Winners" breadcrumbs={[{ label: "Admin" }, { label: "Winners" }]}>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {CATEGORIES.map((c) => {
            const winnerId = winners[c];
            const winner = SUBMISSIONS.find(s => s.id === winnerId);
            return (
              <Card key={c} className={`p-6 ${winner ? "border-gold/40 bg-gradient-to-br from-gold/10 to-transparent" : ""}`}>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <Trophy className={`size-4 ${winner ? "text-gold-foreground" : ""}`} /> {c}
                </div>
                <div className="mt-3 font-display text-lg font-semibold">{winner ? winner.title : "No winner selected"}</div>
                {winner && <div className="mt-1 text-sm text-muted-foreground">{winner.team}</div>}
                <select
                  value={winnerId ?? ""}
                  onChange={(e) => set(c, e.target.value)}
                  className="mt-4 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">— Select submission —</option>
                  {SUBMISSIONS.slice(0, 12).map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
                <Button variant="gold" className="mt-3 w-full" size="sm" onClick={() => toast.success("Winner confirmed")}>Mark winner</Button>
              </Card>
            );
          })}
        </div>
      </AppShell>
    );
  },
});
