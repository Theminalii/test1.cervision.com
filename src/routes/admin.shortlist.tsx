import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { apiDelete, apiPost, useApiQuery } from "@/lib/api-client";

export const Route = createFileRoute("/admin/shortlist")({
  head: () => ({ meta: [{ title: "Shortlist — Admin — KAFD" }] }),
  component: () => {
    const queryClient = useQueryClient();
    const { data: shortlist = [] } = useApiQuery<Array<any>>(["admin-shortlist"], "/api/admin/shortlist");
    const { data: all = [] } = useApiQuery<Array<any>>(["admin-submissions"], "/api/admin/submissions");
    const ids = new Set(shortlist.map((item) => item.id));
    return (
      <AppShell role="admin" title="Shortlist" breadcrumbs={[{ label: "Admin" }, { label: "Shortlist" }]}>
        <div className="grid gap-4">
          {all.slice(0, 12).map((s) => {
            const isOn = ids.has(s.id);
            return (
              <Card key={s.id} className={`flex flex-wrap items-center justify-between gap-4 p-5 ${isOn ? "border-gold/40 bg-gradient-to-r from-gold/8 to-transparent" : ""}`}>
                <div className="flex items-center gap-4">
                  <div className={`grid size-10 place-items-center rounded-lg ${isOn ? "bg-gold/20 text-gold-foreground" : "bg-muted text-muted-foreground"}`}><Star className="size-5" /></div>
                  <div>
                    <div className="font-display font-semibold">{s.title}</div>
                    <div className="text-xs text-muted-foreground">{s.teamName} · {s.status}</div>
                  </div>
                </div>
                <Button variant={isOn ? "gold" : "outline"} size="sm" onClick={async () => {
                  try {
                    if (isOn) {
                      await apiDelete(`/api/admin/submissions/${s.id}/shortlist`);
                      toast.success("Removed from shortlist");
                    } else {
                      await apiPost(`/api/admin/submissions/${s.id}/shortlist`, {});
                      toast.success("Shortlisted");
                    }
                    await queryClient.invalidateQueries({ queryKey: ["admin-shortlist"] });
                    await queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Update failed");
                  }
                }}>{isOn ? "Shortlisted" : "Mark as shortlisted"}</Button>
              </Card>
            );
          })}
        </div>
      </AppShell>
    );
  },
});
