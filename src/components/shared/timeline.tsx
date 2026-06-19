import { cn } from "@/lib/utils";

type Item = { label: string; date?: string; status: "done" | "active" | "upcoming"; description?: string };

export function Timeline({ items, className }: { items: Item[]; className?: string }) {
  return (
    <ol className={cn("relative space-y-6 border-l border-border pl-6", className)}>
      {items.map((it, idx) => {
        const dot =
          it.status === "done"
            ? "bg-success border-success"
            : it.status === "active"
              ? "bg-gold border-gold ring-4 ring-gold/20"
              : "bg-background border-border";
        return (
          <li key={idx} className="relative">
            <span className={cn("absolute -left-[31px] top-1.5 size-3 rounded-full border-2", dot)} />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-display text-sm font-semibold">{it.label}</div>
              {it.date && <div className="text-xs text-muted-foreground">{it.date}</div>}
            </div>
            {it.description && <p className="mt-1 text-sm text-muted-foreground">{it.description}</p>}
          </li>
        );
      })}
    </ol>
  );
}
