import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col items-center justify-center gap-3 border-dashed p-12 text-center", className)}>
      {Icon && (
        <div className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-6" />
        </div>
      )}
      <div className="font-display text-base font-semibold">{title}</div>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </Card>
  );
}
