import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon?: LucideIcon;
  tone?: "default" | "gold" | "success" | "warning" | "info" | "destructive";
  hint?: string;
}) {
  const toneClass = {
    default: "border-border",
    gold: "border-gold/30 bg-gradient-to-br from-gold/8 to-transparent",
    success: "border-success/20",
    warning: "border-warning/30",
    info: "border-info/20",
    destructive: "border-destructive/20",
  }[tone];

  const iconBg = {
    default: "bg-muted text-foreground",
    gold: "bg-gold/15 text-gold-foreground",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    info: "bg-info/10 text-info",
    destructive: "bg-destructive/10 text-destructive",
  }[tone];

  return (
    <Card className={cn("p-5", toneClass)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        {Icon && (
          <div className={cn("grid size-10 shrink-0 place-items-center rounded-lg", iconBg)}>
            <Icon className="size-5" />
          </div>
        )}
      </div>
      {delta && <div className="mt-3 text-xs text-success">{delta}</div>}
    </Card>
  );
}
