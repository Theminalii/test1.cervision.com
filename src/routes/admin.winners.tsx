import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { apiDelete, apiPost, useApiQuery } from "@/lib/api-client";

const CATEGORIES = ["1st Place", "2nd Place", "3rd Place", "Smart City Track", "FinTech Track", "Sustainability Track"];

export const Route = createFileRoute("/admin/winners")({
  head: () => ({ meta: [{ title: "Winners — Admin — KAFD" }] }),
  component: () => {
    const queryClient = useQueryClient();
    const { data: winners = [] } = useApiQuery<Array<any>>(["admin-winners"], "/api/admin/winners");
    const { data: all = [] } = useApiQuery<Array<any>>(["admin-submissions"], "/api/admin/submissions");
    return (
      <AppShell role="admin" title="Winners" breadcrumbs={[{ label: "Admin" }, { label: "Winners" }]}>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {CATEGORIES.map((c, index) => {
            const winner = winners[index] ?? null;
            const winnerId = winner?.id ?? "";
            return (
              <Card key={c} className={`p-6 ${winner ? "border-gold/40 bg-gradient-to-br from-gold/10 to-transparent" : ""}`}>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <Trophy className={`size-4 ${winner ? "text-gold-foreground" : ""}`} /> {c}
                </div>
                <div className="mt-3 font-display text-lg font-semibold">{winner ? winner.title : "No winner selected"}</div>
                {winner && <div className="mt-1 text-sm text-muted-foreground">{winner.teamName}</div>}
                <select
                  value={winnerId ?? ""}
                  onChange={async (e) => {
                    try {
                      if (e.target.value) {
                        await apiPost(`/api/admin/submissions/${e.target.value}/winner`, {});
                        toast.success(`${c} winner set`);
                        await queryClient.invalidateQueries({ queryKey: ["admin-winners"] });
                        await queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
                      }
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "Winner update failed");
                    }
                  }}
                  className="mt-4 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">— Select submission —</option>
                  {all.slice(0, 12).map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
                <Button variant="gold" className="mt-3 w-full" size="sm" onClick={async () => {
                  try {
                    if (!winnerId) return;
                    await apiDelete(`/api/admin/submissions/${winnerId}/winner`);
                    toast.success("Winner removed");
                    await queryClient.invalidateQueries({ queryKey: ["admin-winners"] });
                    await queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Winner removal failed");
                  }
                }}>Remove winner</Button>
              </Card>
            );
          })}
        </div>
      </AppShell>
    );
  },
});
